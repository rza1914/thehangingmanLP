import "./styles/variables.css";
import "./styles/base.css";
import "./styles/components.css";

import { I18nStore } from "./i18n/i18n";
import { renderHeader } from "./components/header";
import { renderStage } from "./components/stage";
import { renderFaq } from "./components/faq";
import { renderContact } from "./components/contact";
import { config } from "./config";
import { initDepthField, destroyDepthField } from "./components/depthField";
import { initVisibilityPause, onFrame, setPaused } from "./scheduler";

/* One warning is logged if the scene/canvas/cursor cannot initialise.
   The page never goes blank: the semantic layout still renders. */
let sceneWarned = false;
function warnScene(message: string): void {
  if (sceneWarned) return;
  sceneWarned = true;
  console.warn("[the-hanging-man] scene degraded: " + message);
}

function featureDetected(): {
  intersectionObserver: boolean;
  canvas: boolean;
  css3d: boolean;
  matchMedia: boolean;
} {
  return {
    intersectionObserver: typeof IntersectionObserver !== "undefined",
    canvas: (() => {
      try {
        return !!document.createElement("canvas").getContext("2d");
      } catch {
        return false;
      }
    })(),
    css3d: (() => {
      const el = document.createElement("div");
      return "perspective" in el.style || "webkitPerspective" in el.style;
    })(),
    matchMedia: typeof matchMedia !== "undefined",
  };
}

function validateConfig(): void {
  const api = config.apiBaseUrl;
  const isDev = (import.meta as unknown as { dev?: boolean }).dev === true;
  if (!api || !/^https?:\/\//i.test(api)) {
    const message = `VITE_API_BASE_URL is missing or invalid ("${api}"). Set it in .env for local dev.`;
    if (isDev) {
      /* clear dev error, not a production failure */
      console.error("[the-hanging-man] " + message);
    } else {
      warnScene(message);
    }
  }
}

function bootstrap(): void {
  const app = document.getElementById("app");
  if (!app) {
    throw new Error("Root element #app not found");
  }

  validateConfig();

  const { intersectionObserver, canvas, css3d, matchMedia: mm } = featureDetected();
  if (!intersectionObserver || !canvas || !css3d || !mm) {
    warnScene(
      "missing features: IntersectionObserver=" +
        intersectionObserver +
        " canvas=" +
        canvas +
        " css3d=" +
        css3d +
        " matchMedia=" +
        mm
    );
  }

  /* Heavy modules initialise on idle so they never block first paint. */
  requestIdleCallback
    ? requestIdleCallback(() => {
        try {
          initDepthField();
        } catch (err) {
          destroyDepthField();
          warnScene("depth field failed to initialise: " + String(err));
        }
      }, { timeout: 2000 })
    : (() => {
        try {
          initDepthField();
        } catch (err) {
          destroyDepthField();
          warnScene("depth field failed to initialise: " + String(err));
        }
      })();

  initVisibilityPause();

  const i18n = new I18nStore(config.defaultLocale);
  i18n.init();

  app.appendChild(renderHeader(i18n));

  /* ---- stage host ---- */
  const stageHost = document.createElement("div");
  stageHost.className = "stage-host";
  app.appendChild(stageHost);
  try {
    renderStage(i18n, stageHost);
  } catch (err) {
    warnScene("stage failed to render: " + String(err));
  }

  /* the stage hands off to the content — one thin fading line */
  const stageExit = document.createElement("div");
  stageExit.className = "stage-exit";
  stageExit.setAttribute("aria-hidden", "true");
  app.appendChild(stageExit);

  /* ---- remaining sections ---- */
  try {
    app.appendChild(renderFaq(i18n));
  } catch (err) {
    warnScene("faq failed to render: " + String(err));
  }
  try {
    app.appendChild(renderContact(i18n));
  } catch (err) {
    warnScene("contact failed to render: " + String(err));
  }

  /* ---- cursor spotlight (shared scheduler: one write per frame) ---- */
  const spot = document.getElementById("atmSpot");
  if (spot && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let mx = 0;
    let my = 0;
    const applySpot = () => {
      spot.style.setProperty("--mx", mx + "px");
      spot.style.setProperty("--my", my + "px");
    };
    const unsub = onFrame(() => {
      applySpot();
    });
    addEventListener(
      "pointermove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );
    applySpot();
    /* expose unsub so teardown can stop the cursor loop */
    (window as unknown as { __thmCursorUnsub?: () => void }).__thmCursorUnsub = unsub;
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
