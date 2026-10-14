import "./styles/variables.css";
import "./styles/base.css";
import "./styles/components.css";

import { I18nStore } from "./i18n/i18n";
import { renderHeader } from "./components/header";
import { renderStage } from "./components/stage";
import { renderFaq } from "./components/faq";
import { renderContact } from "./components/contact";
import { config } from "./config";
import { initDepthField } from "./components/depthField";

function bootstrap(): void {
  const app = document.getElementById("app");
  if (!app) {
    throw new Error("Root element #app not found");
  }

  initDepthField();

  const i18n = new I18nStore(config.defaultLocale);
  i18n.init();

  app.appendChild(renderHeader(i18n));

  /* ---- stage host ---- */
  const stageHost = document.createElement("div");
  stageHost.className = "stage-host";
  app.appendChild(stageHost);
  renderStage(i18n, stageHost);

  /* the stage hands off to the content — one thin fading line */
  const stageExit = document.createElement("div");
  stageExit.className = "stage-exit";
  stageExit.setAttribute("aria-hidden", "true");
  app.appendChild(stageExit);

  /* ---- remaining sections ---- */
  app.appendChild(renderFaq(i18n));
  app.appendChild(renderContact(i18n));

  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const spot = document.getElementById('atmSpot');
    addEventListener('pointermove', (e) => {
      spot?.style.setProperty('--mx', e.clientX + 'px');
      spot?.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);