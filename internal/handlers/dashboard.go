package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/tbd-milsim/reforger-backend/internal/middleware"
	"github.com/tbd-milsim/reforger-backend/internal/models"
)

// eventSummary is the "Awaiting Deployment" card on the dashboard.
type eventSummary struct {
	EventID    string    `json:"event_id"`
	Name       string    `json:"name"`
	Terrain    string    `json:"terrain"`
	StartTime  time.Time `json:"start_time"`
	Registered int64     `json:"registered"`
	MaxSlots   int       `json:"max_slots"`
	Status     string    `json:"status"`
}

// assignmentSummary is the player's ORBAT posting for the next operation.
type assignmentSummary struct {
	EventID string `json:"event_id"`
	Name    string `json:"name"`
	Faction string `json:"faction"`
	Squad   string `json:"squad"`
	Role    string `json:"role"`
}

// GetDashboard aggregates the home view: next operation, the caller's assigned
// ORBAT slot, live server status, current modpack, and recent announcements.
// Event/ORBAT/server data is populated by later milestones; fields are null-safe.
func (h *Handler) GetDashboard(c *gin.Context) {
	me := middleware.DiscordID(c)
	now := time.Now()

	resp := gin.H{
		"next_event":           nil,
		"my_assignment":        nil,
		"server_status":        nil,
		"current_modpack":      nil,
		"recent_announcements": []models.Announcement{},
	}

	// Next upcoming operation.
	var ev models.Event
	err := h.db.
		Where("start_time > ? AND status::text IN ?", now, []string{"scheduled", "open", "live"}).
		Order("start_time ASC").First(&ev).Error
	if err == nil {
		var m models.Mission
		_ = h.db.First(&m, "id = ?", ev.MissionID).Error
		var registered int64
		h.db.Model(&models.EventRegistration{}).
			Where("event_id = ? AND state::text IN ?", ev.ID, []string{"registered", "waitlisted"}).
			Count(&registered)
		name := ev.NameOverride
		if name == "" {
			name = m.Title
		}
		resp["next_event"] = eventSummary{
			EventID:    ev.ID.String(),
			Name:       name,
			Terrain:    string(m.Terrain),
			StartTime:  ev.StartTime,
			Registered: registered,
			MaxSlots:   ev.MaxSlots,
			Status:     string(ev.Status),
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "dashboard event lookup failed"})
		return
	}

	// Caller's assigned ORBAT slot for an upcoming operation.
	var slot models.OrbatSlot
	err = h.db.
		Joins("JOIN events ON events.id = orbat_slots.event_id").
		Where("orbat_slots.assigned_to = ? AND events.start_time > ? AND events.deleted_at IS NULL", me, now).
		Order("events.start_time ASC").First(&slot).Error
	if err == nil {
		var aev models.Event
		_ = h.db.First(&aev, "id = ?", slot.EventID).Error
		var m models.Mission
		_ = h.db.First(&m, "id = ?", aev.MissionID).Error
		name := aev.NameOverride
		if name == "" {
			name = m.Title
		}
		resp["my_assignment"] = assignmentSummary{
			EventID: slot.EventID.String(),
			Name:    name,
			Faction: slot.Faction,
			Squad:   slot.Squad,
			Role:    slot.Role,
		}
	}

	// Live server status (single primary server assumption for the dashboard).
	var ss models.ServerStatus
	if err := h.db.First(&ss).Error; err == nil {
		resp["server_status"] = ss
	}

	// Current modpack with its mods.
	if mp, err := h.loadCurrentModpack(); err == nil && mp != nil {
		resp["current_modpack"] = mp
	}

	// Recent announcements.
	var anns []models.Announcement
	h.db.Where("status = ?", models.AnnouncementPublished).
		Order("published_at DESC").Limit(3).Find(&anns)
	resp["recent_announcements"] = anns

	c.JSON(http.StatusOK, resp)
}
