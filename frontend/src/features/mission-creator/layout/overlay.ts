// Shared frosted-glass recipe for the editor's floating overlay panels. More
// transparent + stronger blur than the global `.glass` token (0.7 alpha) so the
// Deck.gl map is clearly visible panning underneath — the "macOS Tactical" look.
// Aegis tokens only (no slate/blue); bg-surface-container-lowest/55 mirrors the
// translucent pattern already used in components/ui/split-pane.tsx.

export const overlayPanel =
  'pointer-events-auto rounded-xl border border-white/10 ' +
  'bg-surface-container-lowest/55 shadow-xl backdrop-blur-xl'
