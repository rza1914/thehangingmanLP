import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";

export function renderHero(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "top";
  section.className = "hero";

  const dict = i18n.getDict();
  const fa = dict.meta.lang === "fa";

  const X = (x: number) => (fa ? 1600 - x : x);

  section.innerHTML = `
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g class="glow">
        <text class="hero-title" x="${fa ? 1480 : 120}" y="118" textLength="380"
              lengthAdjust="spacing" text-anchor="${fa ? 'end' : 'start'}">
          The Hanging Man
        </text>
        <path class="hero-ln" pathLength="1" d="M120 150 H1480"/>
        <path class="hero-v" d="M${X(540)} 0 V900"/>
        <text class="hero-hint" id="heroHint" x="${fa ? 1480 : 120}" y="880"
              text-anchor="${fa ? 'end' : 'start'}">${t(dict, "hero.hint")}</text>
      </g>
    </svg>
    <h1 class="sr-only">The Hanging Man</h1>
    <p class="sr-only">${t(dict, "hero.srLead")}</p>
  `;

  const hint = section.querySelector('#heroHint') as HTMLElement | null;
  const onScroll = () => {
    if (hint) hint.style.opacity = scrollY < 40 ? '1' : '0';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return section;
}