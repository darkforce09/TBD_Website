// Cooperative yield for the boot/load chunk loops (T-060.1.1). A bare `setTimeout(0)`
// between chunks queues a macrotask but does NOT guarantee the browser paints — so the
// load overlay stayed frozen while the main thread churned. Yielding via the scheduler
// (when available) and then waiting one animation frame gives the renderer a chance to
// commit + paint before the next chunk runs, so progress updates are visible.

interface Scheduler {
  yield(): Promise<void>
}

export async function yieldToUi(): Promise<void> {
  const sched = (globalThis as { scheduler?: Scheduler }).scheduler
  if (sched && typeof sched.yield === 'function') await sched.yield()
  else await new Promise((r) => setTimeout(r, 0))
  await new Promise((r) => requestAnimationFrame(() => r(undefined)))
}
