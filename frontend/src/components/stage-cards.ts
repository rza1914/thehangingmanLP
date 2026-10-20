/* 3D card interaction for the desktop line scene.
   Single responsibility: tilt .stg-card / .stg-slot elements toward the
   pointer and restore them on leave. No scroll or scene-graph logic here. */
export function initCardInteraction(opts: {
  wrap: HTMLElement;
  fa: boolean;
  enable3D: boolean;
}): () => void {
  const { wrap, fa, enable3D } = opts;
  if (!enable3D) return () => {};

  let cardEls: Array<SVGGElement> = [];
  let cardRects: Array<DOMRect> = [];
  let pointerX = 0;
  let pointerY = 0;
  let targetRx = 0;
  let targetRy = 0;
  let currentRx = 0;
  let currentRy = 0;
  let interactionRaf = 0;
  let pointerInside = false;

  function init3DCards(): void {
    cardEls = Array.from(wrap.querySelectorAll<SVGGElement>(".stg-card, .stg-slot"));
    if (cardEls.length === 0) return;
    const n = cardEls.length;
    cardEls.forEach((el, i) => {
      const visualIndex = fa ? n - 1 - i : i;
      const center = (n - 1) / 2;
      const offset = visualIndex - center;
      const idleDeg = offset * -5;
      const zPx = -Math.abs(offset) * 24;
      el.style.setProperty("--idle", `${idleDeg}deg`);
      el.style.setProperty("--z", `${zPx}px`);
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    });
    updateCardRects();
  }

  function updateCardRects(): void {
    cardRects = cardEls.map((el) => el.getBoundingClientRect());
  }

  function onPointerMove(e: PointerEvent): void {
    if (cardEls.length === 0) return;
    pointerX = e.clientX;
    pointerY = e.clientY;
    pointerInside = true;
    if (!interactionRaf) interactionRaf = requestAnimationFrame(update3DTransform);
  }

  function onPointerLeave(): void {
    pointerInside = false;
    targetRx = 0;
    targetRy = 0;
  }

  function update3DTransform(): void {
    interactionRaf = 0;
    if (!pointerInside) {
      currentRx += (targetRx - currentRx) * 0.15;
      currentRy += (targetRy - currentRy) * 0.15;
      if (Math.abs(currentRx) < 0.01 && Math.abs(currentRy) < 0.01) {
        currentRx = 0;
        currentRy = 0;
      } else {
        requestAnimationFrame(update3DTransform);
      }
    } else {
      updateCardRects();
      cardEls.forEach((el, i) => {
        const rect = cardRects[i];
        if (!rect || rect.width === 0 || rect.height === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const px = (pointerX - cx) / rect.width;
        const py = (pointerY - cy) / rect.height;
        const rx = -py * 14;
        const ry = px * 14;
        el.style.setProperty("--rx", `${rx}deg`);
        el.style.setProperty("--ry", `${ry}deg`);
      });
    }
    if (pointerInside || Math.abs(currentRx) > 0.01 || Math.abs(currentRy) > 0.01) {
      interactionRaf = requestAnimationFrame(update3DTransform);
    }
  }

  function onFocusIn(): void {
    pointerInside = true;
  }

  function onFocusOut(): void {
    pointerInside = false;
    targetRx = 0;
    targetRy = 0;
  }

  init3DCards();
  wrap.addEventListener("pointermove", onPointerMove, { passive: true });
  wrap.addEventListener("pointerleave", onPointerLeave);
  wrap.addEventListener("focusin", onFocusIn);
  wrap.addEventListener("focusout", onFocusOut);
  window.addEventListener("resize", updateCardRects, { passive: true });

  return (): void => {
    wrap.removeEventListener("pointermove", onPointerMove);
    wrap.removeEventListener("pointerleave", onPointerLeave);
    wrap.removeEventListener("focusin", onFocusIn);
    wrap.removeEventListener("focusout", onFocusOut);
    window.removeEventListener("resize", updateCardRects);
    if (interactionRaf) cancelAnimationFrame(interactionRaf);
  };
}
