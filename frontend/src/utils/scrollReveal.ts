const revealedKeys = new Set<string>();

/**
 * Test-only helper to reset module state between isolated test runs.
 * Not used in production code paths.
 */
export function __resetRevealedForTests(): void {
  revealedKeys.clear();
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scans `root` for elements marked with [data-reveal] and animates them into
 * view the first time they cross into the viewport (CSS handles the actual
 * fade/slide transition via the `.is-visible` class — see components.css).
 *
 * Each element should also carry a stable `data-reveal-key`. This lets
 * re-renders (e.g. a language switch rebuilding a component's innerHTML)
 * skip replaying the animation for content the user has already seen —
 * it is marked visible immediately instead, avoiding a jarring re-fade.
 *
 * Respects the user's `prefers-reduced-motion` OS/browser setting by
 * skipping the animation entirely and marking everything visible up front.
 * Also fails safe (immediately visible, no animation) in any environment
 * without IntersectionObserver support.
 */
export function initScrollReveal(root: ParentNode = document): void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (elements.length === 0) return;

  const reduceMotion = prefersReducedMotion();
  const toObserve: HTMLElement[] = [];

  elements.forEach((el) => {
    const key = el.dataset.revealKey;
    if (reduceMotion || (key && revealedKeys.has(key))) {
      el.classList.add("is-visible");
      return;
    }
    toObserve.push(el);
  });

  if (toObserve.length === 0) return;

  if (typeof IntersectionObserver === "undefined") {
    // Environment without IntersectionObserver support: fail safe to visible.
    toObserve.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.classList.add("is-visible");
        const key = el.dataset.revealKey;
        if (key) revealedKeys.add(key);
        obs.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  toObserve.forEach((el) => observer.observe(el));
}