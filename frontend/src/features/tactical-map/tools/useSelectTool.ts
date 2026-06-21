// Pointer gesture state machine for the Select tool (Phase 7b). Deck keeps picking,
// click/dblclick, hover and wheel-zoom; we own every DRAG here so the Eden interaction
// contract holds: left-drag an icon = move, left-drag empty = marquee box-select,
// middle/right-drag = pan. A small movement threshold lets a plain click fall through to
// Deck's onClick (select / deselect). Mutations are reported to the host via onEntitiesMove
// (one Y.Doc transaction = one undo step); selection + transient drag/marquee live in the
// store. The map never pans on left-drag (Deck's dragPan is disabled in TacticalMap).

import { useCallback, useRef } from 'react'
import type { OrthographicView } from '@deck.gl/core'
import type { DeckGLRef } from '@deck.gl/react'
import { useMapStore } from '../state/useMapStore'
import type { ID } from '../state/schema'
import type { MapViewState } from '../types'

type Pt = [number, number]

/** ~4 px of motion separates a click (Deck handles it) from a drag (we handle it). */
const DRAG_THRESHOLD = 4

interface Viewport {
  unproject: (xy: number[]) => number[]
}

type Gesture =
  | { type: 'pending-left'; startPx: Pt; iconId: ID | null }
  | { type: 'move'; ids: ID[]; startWorld: Pt; vp: Viewport }
  | { type: 'marquee'; startPx: Pt; startWorld: Pt; vp: Viewport }
  | { type: 'pan'; startTarget: Pt; startPx: Pt; vp: Viewport }
  | null

interface UseSelectToolArgs {
  deckRef: React.RefObject<DeckGLRef | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  view: OrthographicView
  viewState: MapViewState
  onViewStateChange: (params: { viewState: MapViewState }) => void
  /** Commit a group move (delta in world meters) — host wraps it in one transaction. */
  onEntitiesMove: (ids: ID[], delta: { x: number; y: number }) => void
}

export interface SelectToolHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
}

export function useSelectTool({
  deckRef,
  containerRef,
  view,
  viewState,
  onViewStateChange,
  onEntitiesMove,
}: UseSelectToolArgs): SelectToolHandlers {
  const gesture = useRef<Gesture>(null)

  const localPt = useCallback(
    (e: { clientX: number; clientY: number }): Pt | null => {
      const el = containerRef.current
      if (!el) return null
      const r = el.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top]
    },
    [containerRef],
  )

  const makeViewport = useCallback((): Viewport | null => {
    const el = containerRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return view.makeViewport({ width: r.width, height: r.height, viewState }) as Viewport | null
  }, [containerRef, view, viewState])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const px = localPt(e)
      if (!px) return

      // Middle / right button → pan against a viewport frozen at gesture start. Capture
      // now: these never produce a Deck click, so redirecting events is safe.
      if (e.button === 1 || e.button === 2) {
        const vp = makeViewport()
        if (!vp) return
        e.preventDefault()
        containerRef.current?.setPointerCapture(e.pointerId)
        gesture.current = {
          type: 'pan',
          startTarget: [viewState.target[0], viewState.target[1]],
          startPx: px,
          vp,
        }
        return
      }

      if (e.button !== 0) return
      // Left button: defer the decision (click vs move vs marquee) to the threshold. Do
      // NOT capture yet — a plain click must reach Deck's canvas (onClick → select).
      const info = deckRef.current?.pickObject({
        x: px[0],
        y: px[1],
        radius: 4,
        layerIds: ['slot-icons'],
      })
      const iconId = (info?.object as { id: ID } | undefined)?.id ?? null
      gesture.current = { type: 'pending-left', startPx: px, iconId }
    },
    [localPt, makeViewport, containerRef, deckRef, viewState],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const g = gesture.current
      if (!g) return
      const px = localPt(e)
      if (!px) return

      if (g.type === 'pan') {
        const w0 = g.vp.unproject(g.startPx)
        const w1 = g.vp.unproject(px)
        onViewStateChange({
          viewState: {
            ...viewState,
            target: [g.startTarget[0] - (w1[0] - w0[0]), g.startTarget[1] - (w1[1] - w0[1])],
          },
        })
        return
      }

      // Promote a pending left-press into a move or marquee once it clears the threshold.
      if (g.type === 'pending-left') {
        if (Math.hypot(px[0] - g.startPx[0], px[1] - g.startPx[1]) < DRAG_THRESHOLD) return
        const vp = makeViewport()
        if (!vp) return
        // Now that it's a real drag, capture so it survives leaving the canvas; Deck won't
        // see a matching pointerup, so no stray click fires after the drag.
        containerRef.current?.setPointerCapture(e.pointerId)
        const startWorld = vp.unproject(g.startPx) as Pt
        if (g.iconId) {
          const sel = useMapStore.getState().selection
          const ids =
            sel.kind === 'slot' && sel.ids.includes(g.iconId) ? sel.ids : [g.iconId]
          if (!(sel.kind === 'slot' && sel.ids.includes(g.iconId))) {
            useMapStore.getState().setSelection({ kind: 'slot', ids })
          }
          gesture.current = { type: 'move', ids, startWorld, vp }
        } else {
          gesture.current = { type: 'marquee', startPx: g.startPx, startWorld, vp }
        }
      }

      const cur = gesture.current
      if (cur?.type === 'move') {
        const w1 = cur.vp.unproject(px)
        useMapStore
          .getState()
          .setDrag({ ids: cur.ids, dx: w1[0] - cur.startWorld[0], dy: w1[1] - cur.startWorld[1] })
      } else if (cur?.type === 'marquee') {
        const w1 = cur.vp.unproject(px)
        useMapStore
          .getState()
          .setMarquee({ x0: cur.startWorld[0], y0: cur.startWorld[1], x1: w1[0], y1: w1[1] })
      }
    },
    [localPt, makeViewport, onViewStateChange, viewState, containerRef],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const g = gesture.current
      gesture.current = null
      if (containerRef.current?.hasPointerCapture(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId)
      }
      if (!g) return
      const store = useMapStore.getState()

      if (g.type === 'move') {
        const drag = store.drag
        if (drag && (drag.dx !== 0 || drag.dy !== 0)) {
          onEntitiesMove(g.ids, { x: drag.dx, y: drag.dy })
        }
        store.setDrag(null)
        return
      }

      if (g.type === 'marquee') {
        const px = localPt(e)
        if (px) {
          const x = Math.min(g.startPx[0], px[0])
          const y = Math.min(g.startPx[1], px[1])
          const width = Math.abs(px[0] - g.startPx[0])
          const height = Math.abs(px[1] - g.startPx[1])
          if (width >= 1 && height >= 1) {
            const infos =
              deckRef.current?.pickObjects({ x, y, width, height, layerIds: ['slot-icons'] }) ?? []
            const ids = [...new Set(infos.map((i) => (i.object as { id: ID }).id))]
            store.setSelection(ids.length ? { kind: 'slot', ids } : { kind: 'none', ids: [] })
          }
        }
        store.setMarquee(null)
      }
      // 'pending-left' (sub-threshold) and 'pan' need no commit — Deck's onClick handles clicks.
    },
    [containerRef, deckRef, localPt, onEntitiesMove],
  )

  const onContextMenu = useCallback((e: React.MouseEvent) => e.preventDefault(), [])

  return { onPointerDown, onPointerMove, onPointerUp, onContextMenu }
}
