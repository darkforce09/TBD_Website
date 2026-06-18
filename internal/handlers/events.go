package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/tbd-milsim/reforger-backend/internal/middleware"
	"github.com/tbd-milsim/reforger-backend/internal/models"
)

// Sentinel errors used to map registration transaction failures to HTTP codes.
var (
	errBadSlot      = errors.New("invalid slot id")
	errSlotNotFound = errors.New("slot not found")
	errSlotTaken    = errors.New("slot taken")
)

func validEventStatus(s string) (models.EventStatus, bool) {
	switch models.EventStatus(s) {
	case models.EventScheduled, models.EventOpen, models.EventLocked,
		models.EventLive, models.EventCompleted, models.EventCancelled:
		return models.EventStatus(s), true
	case "":
		return models.EventScheduled, true
	default:
		return "", false
	}
}

// canRegisterStatus reports whether registration is permitted for a status.
func canRegisterStatus(s models.EventStatus) bool {
	return s == models.EventScheduled || s == models.EventOpen
}

// orbatTemplateItem describes a squad row to expand into individual slots.
type orbatTemplateItem struct {
	Faction  string `json:"faction"`
	Callsign string `json:"callsign"`
	Squad    string `json:"squad"`
	Role     string `json:"role"`
	Count    int    `json:"count"`
}

// parseOrbatTemplate extracts an "orbat" array from a mission version payload.
func parseOrbatTemplate(payload []byte) []orbatTemplateItem {
	var p struct {
		Orbat []orbatTemplateItem `json:"orbat"`
	}
	_ = json.Unmarshal(payload, &p)
	return p.Orbat
}

// materializeSlots expands template rows into OrbatSlot records. slot_index is
// sequential within a squad (across roles) to satisfy the unique constraint.
func materializeSlots(tx *gorm.DB, eventID uuid.UUID, items []orbatTemplateItem) error {
	squadIdx := map[string]int{}
	rows := make([]models.OrbatSlot, 0)
	for _, it := range items {
		count := it.Count
		if count <= 0 {
			count = 1
		}
		for i := 0; i < count; i++ {
			rows = append(rows, models.OrbatSlot{
				EventID:   eventID,
				Faction:   it.Faction,
				Callsign:  it.Callsign,
				Squad:     it.Squad,
				Role:      it.Role,
				SlotIndex: squadIdx[it.Squad],
			})
			squadIdx[it.Squad]++
		}
	}
	if len(rows) == 0 {
		return nil
	}
	return tx.Create(&rows).Error
}

// createEventInput is the Event Manager "Schedule Operation" body.
type createEventInput struct {
	MissionID          string              `json:"mission_id" binding:"required"`
	StartTime          time.Time           `json:"start_time" binding:"required"`
	MaxSlots           int                 `json:"max_slots" binding:"required"`
	NameOverride       string              `json:"name_override"`
	RegistrationLocked bool                `json:"registration_locked"`
	Status             string              `json:"status"`
	Orbat              []orbatTemplateItem `json:"orbat"` // optional; else taken from mission
}

// CreateEvent schedules an operation and materializes its ORBAT (admin only).
func (h *Handler) CreateEvent(c *gin.Context) {
	var in createEventInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "mission_id, start_time and max_slots are required"})
		return
	}
	missionID, err := uuid.Parse(in.MissionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid mission_id"})
		return
	}
	status, ok := validEventStatus(in.Status)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}
	var mission models.Mission
	if err := h.db.First(&mission, "id = ?", missionID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "mission not found"})
		return
	}

	// Resolve the ORBAT template: explicit input wins, else the mission payload.
	template := in.Orbat
	if len(template) == 0 && mission.CurrentVersionID != nil {
		var v models.MissionVersion
		if err := h.db.First(&v, "id = ?", *mission.CurrentVersionID).Error; err == nil {
			template = parseOrbatTemplate(v.JSONPayload)
		}
	}

	event := models.Event{
		MissionID:          missionID,
		NameOverride:       in.NameOverride,
		StartTime:          in.StartTime,
		Status:             status,
		RegistrationLocked: in.RegistrationLocked,
		MaxSlots:           in.MaxSlots,
		CreatedBy:          middleware.DiscordID(c),
	}
	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&event).Error; err != nil {
			return err
		}
		return materializeSlots(tx, event.ID, template)
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create event"})
		return
	}

	_ = h.db.First(&event, "id = ?", event.ID).Error
	c.JSON(http.StatusCreated, event)
}

// eventListItem is an Upcoming Operations row.
type eventListItem struct {
	models.Event
	MissionTitle string `json:"mission_title"`
	Terrain      string `json:"terrain"`
	Registered   int64  `json:"registered"`
	Percent      int    `json:"percent"`
}

// ListEvents returns operations for the Upcoming/Calendar views.
// Query: ?scope=upcoming|past|all
func (h *Handler) ListEvents(c *gin.Context) {
	limit, offset := parsePage(c)
	now := time.Now()

	q := h.db.Model(&models.Event{})
	switch c.DefaultQuery("scope", "upcoming") {
	case "past":
		q = q.Where("start_time <= ?", now).Order("start_time DESC")
	case "all":
		q = q.Order("start_time ASC")
	default:
		q = q.Where("start_time > ? OR status::text = ?", now, "live").Order("start_time ASC")
	}

	var total int64
	q.Count(&total)

	var events []models.Event
	if err := q.Limit(limit).Offset(offset).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   h.decorateEvents(events),
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// decorateEvents batch-loads mission titles/terrain and registration counts.
func (h *Handler) decorateEvents(events []models.Event) []eventListItem {
	missionIDs := make([]uuid.UUID, 0, len(events))
	eventIDs := make([]uuid.UUID, 0, len(events))
	for _, e := range events {
		missionIDs = append(missionIDs, e.MissionID)
		eventIDs = append(eventIDs, e.ID)
	}

	missions := map[uuid.UUID]models.Mission{}
	if len(missionIDs) > 0 {
		var ms []models.Mission
		h.db.Where("id IN ?", missionIDs).Find(&ms)
		for _, m := range ms {
			missions[m.ID] = m
		}
	}

	counts := map[uuid.UUID]int64{}
	if len(eventIDs) > 0 {
		type row struct {
			EventID uuid.UUID
			N       int64
		}
		var rows []row
		h.db.Model(&models.EventRegistration{}).
			Select("event_id, count(*) as n").
			Where("event_id IN ? AND state::text = ?", eventIDs, "registered").
			Group("event_id").Scan(&rows)
		for _, r := range rows {
			counts[r.EventID] = r.N
		}
	}

	out := make([]eventListItem, 0, len(events))
	for _, e := range events {
		m := missions[e.MissionID]
		name := e.NameOverride
		if name == "" {
			name = m.Title
		}
		registered := counts[e.ID]
		percent := 0
		if e.MaxSlots > 0 {
			percent = int(registered * 100 / int64(e.MaxSlots))
		}
		item := eventListItem{Event: e, MissionTitle: name, Terrain: string(m.Terrain), Registered: registered, Percent: percent}
		out = append(out, item)
	}
	return out
}

// GetEvent returns event detail including the caller's registration state.
func (h *Handler) GetEvent(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	item := h.decorateEvents([]models.Event{*ev})[0]

	var reg models.EventRegistration
	myState := ""
	var mySlot *string
	if err := h.db.First(&reg, "event_id = ? AND discord_id = ?", ev.ID, middleware.DiscordID(c)).Error; err == nil {
		myState = string(reg.State)
		if reg.SlotID != nil {
			s := reg.SlotID.String()
			mySlot = &s
		}
	}

	c.JSON(http.StatusOK, gin.H{"event": item, "my_state": myState, "my_slot_id": mySlot})
}

// patchEventInput edits schedule/lock/status.
type patchEventInput struct {
	StartTime          *time.Time `json:"start_time"`
	MaxSlots           *int       `json:"max_slots"`
	NameOverride       *string    `json:"name_override"`
	RegistrationLocked *bool      `json:"registration_locked"`
	Status             *string    `json:"status"`
}

// UpdateEvent edits an event (admin only).
func (h *Handler) UpdateEvent(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	var in patchEventInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	updates := map[string]any{}
	if in.StartTime != nil {
		updates["start_time"] = *in.StartTime
	}
	if in.MaxSlots != nil {
		updates["max_slots"] = *in.MaxSlots
	}
	if in.NameOverride != nil {
		updates["name_override"] = *in.NameOverride
	}
	if in.RegistrationLocked != nil {
		updates["registration_locked"] = *in.RegistrationLocked
	}
	if in.Status != nil {
		st, ok := validEventStatus(*in.Status)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
			return
		}
		updates["status"] = st
	}
	if len(updates) > 0 {
		if err := h.db.Model(ev).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update event"})
			return
		}
	}
	_ = h.db.First(ev, "id = ?", ev.ID).Error
	c.JSON(http.StatusOK, ev)
}

// DeleteEvent cancels/removes an event (admin only, soft delete).
func (h *Handler) DeleteEvent(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	if err := h.db.Delete(ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete event"})
		return
	}
	c.Status(http.StatusNoContent)
}

// --- ORBAT ---

type orbatSlotDTO struct {
	ID           string  `json:"id"`
	Role         string  `json:"role"`
	SlotIndex    int     `json:"slot_index"`
	AssignedTo   *string `json:"assigned_to"`
	AssignedName string  `json:"assigned_name,omitempty"`
}

type orbatSquadDTO struct {
	Faction  string         `json:"faction"`
	Callsign string         `json:"callsign,omitempty"`
	Squad    string         `json:"squad"`
	Filled   int            `json:"filled"`
	Total    int            `json:"total"`
	Slots    []orbatSlotDTO `json:"slots"`
}

// GetOrbat returns the ORBAT grouped by squad with filled/total counts.
func (h *Handler) GetOrbat(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	var slots []models.OrbatSlot
	h.db.Where("event_id = ?", ev.ID).
		Order("faction ASC").Order("squad ASC").Order("slot_index ASC").
		Find(&slots)

	// Resolve assigned usernames.
	ids := make([]string, 0)
	for _, s := range slots {
		if s.AssignedTo != nil {
			ids = append(ids, *s.AssignedTo)
		}
	}
	names := map[string]string{}
	if len(ids) > 0 {
		var us []models.User
		h.db.Where("discord_id IN ?", ids).Find(&us)
		for _, u := range us {
			names[u.DiscordID] = u.Username
		}
	}

	// Group by squad, preserving order.
	order := make([]string, 0)
	groups := map[string]*orbatSquadDTO{}
	for _, s := range slots {
		g, exists := groups[s.Squad]
		if !exists {
			g = &orbatSquadDTO{Faction: s.Faction, Callsign: s.Callsign, Squad: s.Squad}
			groups[s.Squad] = g
			order = append(order, s.Squad)
		}
		dto := orbatSlotDTO{ID: s.ID.String(), Role: s.Role, SlotIndex: s.SlotIndex, AssignedTo: s.AssignedTo}
		if s.AssignedTo != nil {
			dto.AssignedName = names[*s.AssignedTo]
			g.Filled++
		}
		g.Total++
		g.Slots = append(g.Slots, dto)
	}

	out := make([]orbatSquadDTO, 0, len(order))
	for _, sq := range order {
		out = append(out, *groups[sq])
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

// --- Registration ---

type registerBody struct {
	SlotID string `json:"slot_id"`
}

// RegisterForEvent signs the caller up, claiming a slot if provided, otherwise
// granting a confirmed spot or a waitlist place based on capacity.
func (h *Handler) RegisterForEvent(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	me := middleware.DiscordID(c)
	if !canRegisterStatus(ev.Status) {
		c.JSON(http.StatusConflict, gin.H{"error": "registration is closed for this operation"})
		return
	}
	if ev.RegistrationLocked && middleware.Role(c) != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "registration is locked; an admin must assign you"})
		return
	}

	var body registerBody
	_ = c.ShouldBindJSON(&body)

	var result models.EventRegistration
	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		var registered int64
		tx.Model(&models.EventRegistration{}).
			Where("event_id = ? AND state::text = ? AND discord_id <> ?", ev.ID, "registered", me).
			Count(&registered)

		state := models.RegRegistered
		var slotID *uuid.UUID

		if body.SlotID != "" {
			sid, err := uuid.Parse(body.SlotID)
			if err != nil {
				return errBadSlot
			}
			var slot models.OrbatSlot
			if err := tx.First(&slot, "id = ? AND event_id = ?", sid, ev.ID).Error; err != nil {
				return errSlotNotFound
			}
			if slot.AssignedTo != nil && *slot.AssignedTo != me {
				return errSlotTaken
			}
			now := time.Now()
			if err := tx.Model(&models.OrbatSlot{}).Where("id = ?", sid).
				Updates(map[string]any{"assigned_to": me, "assigned_at": now}).Error; err != nil {
				return err
			}
			slotID = &sid
		} else if registered >= int64(ev.MaxSlots) {
			state = models.RegWaitlisted
		}

		reg := models.EventRegistration{
			EventID:   ev.ID,
			DiscordID: me,
			SlotID:    slotID,
			State:     state,
		}
		if err := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "event_id"}, {Name: "discord_id"}},
			DoUpdates: clause.AssignmentColumns([]string{"slot_id", "state"}),
		}).Create(&reg).Error; err != nil {
			return err
		}
		result = reg
		return nil
	})

	switch txErr {
	case nil:
		c.JSON(http.StatusOK, gin.H{"state": result.State, "slot_id": result.SlotID})
	case errBadSlot, errSlotNotFound:
		c.JSON(http.StatusNotFound, gin.H{"error": "slot not found"})
	case errSlotTaken:
		c.JSON(http.StatusConflict, gin.H{"error": "slot already taken"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not register"})
	}
}

// WithdrawFromEvent removes the caller's registration and promotes the oldest
// waitlisted member if a confirmed spot was freed.
func (h *Handler) WithdrawFromEvent(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	me := middleware.DiscordID(c)

	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		var reg models.EventRegistration
		if err := tx.First(&reg, "event_id = ? AND discord_id = ?", ev.ID, me).Error; err != nil {
			return gorm.ErrRecordNotFound
		}
		// Free any claimed slot.
		if reg.SlotID != nil {
			tx.Model(&models.OrbatSlot{}).Where("id = ?", *reg.SlotID).
				Updates(map[string]any{"assigned_to": nil, "assigned_at": nil})
		}
		wasRegistered := reg.State == models.RegRegistered
		if err := tx.Delete(&reg).Error; err != nil {
			return err
		}
		// Promote the oldest waitlisted member into the freed spot.
		if wasRegistered {
			var next models.EventRegistration
			if err := tx.Where("event_id = ? AND state::text = ?", ev.ID, "waitlisted").
				Order("registered_at ASC").First(&next).Error; err == nil {
				tx.Model(&models.EventRegistration{}).Where("id = ?", next.ID).
					Update("state", models.RegRegistered)
			}
		}
		return nil
	})
	if txErr == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "not registered"})
		return
	}
	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not withdraw"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"withdrawn": true})
}

// --- Slot assignment (admin) ---

type assignSlotInput struct {
	DiscordID string `json:"discord_id" binding:"required"`
}

// AssignSlot assigns or reassigns a user to an ORBAT slot and ensures they have
// a confirmed registration (admin only).
func (h *Handler) AssignSlot(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid slot id"})
		return
	}
	var in assignSlotInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "discord_id required"})
		return
	}
	var target models.User
	if err := h.db.First(&target, "discord_id = ?", in.DiscordID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})
		return
	}

	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		var slot models.OrbatSlot
		if err := tx.First(&slot, "id = ? AND event_id = ?", slotID, ev.ID).Error; err != nil {
			return gorm.ErrRecordNotFound
		}
		now := time.Now()
		if err := tx.Model(&models.OrbatSlot{}).Where("id = ?", slotID).
			Updates(map[string]any{"assigned_to": in.DiscordID, "assigned_at": now}).Error; err != nil {
			return err
		}
		reg := models.EventRegistration{
			EventID:   ev.ID,
			DiscordID: in.DiscordID,
			SlotID:    &slotID,
			State:     models.RegRegistered,
		}
		return tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "event_id"}, {Name: "discord_id"}},
			DoUpdates: clause.AssignmentColumns([]string{"slot_id", "state"}),
		}).Create(&reg).Error
	})
	if txErr == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "slot not found"})
		return
	}
	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not assign slot"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"assigned_to": in.DiscordID})
}

// ClearSlot unassigns an ORBAT slot (admin only).
func (h *Handler) ClearSlot(c *gin.Context) {
	ev, ok := h.loadEvent(c)
	if !ok {
		return
	}
	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid slot id"})
		return
	}
	h.db.Transaction(func(tx *gorm.DB) error {
		tx.Model(&models.OrbatSlot{}).Where("id = ? AND event_id = ?", slotID, ev.ID).
			Updates(map[string]any{"assigned_to": nil, "assigned_at": nil})
		tx.Model(&models.EventRegistration{}).Where("event_id = ? AND slot_id = ?", ev.ID, slotID).
			Update("slot_id", nil)
		return nil
	})
	c.JSON(http.StatusOK, gin.H{"cleared": true})
}

// --- helpers ---

func (h *Handler) loadEvent(c *gin.Context) (*models.Event, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return nil, false
	}
	var ev models.Event
	if err := h.db.First(&ev, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return nil, false
	}
	return &ev, true
}
