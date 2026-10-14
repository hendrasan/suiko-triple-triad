// Drag a hand card onto a board cell. Works with mouse and touch (Pointer Events).
// A short move (under THRESHOLD px) stays a normal tap, so tap-to-select still works.

export interface DragOpts {
  /** Return false to ignore the drag (for example, not your turn). */
  enabled: () => boolean;
  start: () => void;
  /** Pointer position and the empty cell under it (or null). */
  move: (x: number, y: number, cell: number | null) => void;
  /** Called on release with the empty cell under the pointer (or null). */
  drop: (cell: number | null) => void;
}

const THRESHOLD = 8;

function cellAt(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y)?.closest<HTMLButtonElement>('[data-cell]');
  return el && !el.disabled ? Number(el.dataset.cell) : null;
}

export function dragToCell(node: HTMLElement, opts: DragOpts) {
  let start: { x: number; y: number; id: number } | null = null;
  let dragging = false;

  function down(e: PointerEvent) {
    if (e.button !== 0 || !opts.enabled()) return;
    start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    dragging = false;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  }

  function move(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return;
    if (!dragging) {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < THRESHOLD) return;
      dragging = true;
      opts.start();
    }
    e.preventDefault();
    opts.move(e.clientX, e.clientY, cellAt(e.clientX, e.clientY));
  }

  function up(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return;
    if (dragging) {
      // Swallow the click that follows a drag, so it does not toggle the selection.
      const stop = (ev: Event) => ev.stopPropagation();
      window.addEventListener('click', stop, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
      opts.drop(cellAt(e.clientX, e.clientY));
    }
    end();
  }

  function cancel() {
    if (dragging) opts.drop(null);
    end();
  }

  function end() {
    start = null;
    dragging = false;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
  }

  node.addEventListener('pointerdown', down);
  return {
    update(next: DragOpts) {
      opts = next;
    },
    destroy() {
      end();
      node.removeEventListener('pointerdown', down);
    },
  };
}
