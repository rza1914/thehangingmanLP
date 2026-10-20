/* Shared requestAnimationFrame scheduler.
   Scene, depth field and cursor all register a single callback per frame instead
   of each module running its own loop. Loops pause when the document is hidden
   and resume when it becomes visible again. */
type FrameTask = (now: number) => void;

const tasks = new Set<FrameTask>();
let rafId: number | null = null;
let running = false;

function start(): void {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(tick);
}

function stop(): void {
  running = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function tick(now: number): void {
  if (!running) return;
  const snapshot = Array.from(tasks);
  for (let i = 0; i < snapshot.length; i++) {
    snapshot[i](now);
  }
  rafId = requestAnimationFrame(tick);
}

/* Register a task to run every frame while the document is visible.
   Returns an unsubscribe function. */
export function onFrame(task: FrameTask): () => void {
  tasks.add(task);
  if (!running) start();
  return () => {
    tasks.delete(task);
    if (tasks.size === 0) stop();
  };
}

/* Pause / resume all frame tasks (called on visibilitychange). */
export function setPaused(paused: boolean): void {
  paused ? stop() : start();
}

/* How many tasks are scheduled (for diagnostics/tests). */
export function frameTaskCount(): number {
  return tasks.size;
}

/* Document visibility lifecycle. Call once at bootstrap. */
export function initVisibilityPause(): void {
  const onChange = (): void => setPaused(document.hidden);
  document.addEventListener('visibilitychange', onChange, { passive: true });
  setPaused(document.hidden);
}
