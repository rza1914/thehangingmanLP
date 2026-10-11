import "./styles/variables.css";
import "./styles/base.css";
import "./styles/components.css";

import { I18nStore } from "./i18n/i18n";
import { renderHeader } from "./components/header";
import { renderHero } from "./components/hero";
import { renderServices } from "./components/services";
import { renderApproach } from "./components/approach";
import { config } from "./config";

function bootstrap(): void {
  const app = document.getElementById("app");
  if (!app) {
    throw new Error("Root element #app not found");
  }

  const i18n = new I18nStore(config.defaultLocale);
  i18n.init();

  app.appendChild(renderHeader(i18n));
  app.appendChild(renderHero(i18n));
  app.appendChild(renderServices(i18n));
  app.appendChild(renderApproach(i18n));
}

document.addEventListener("DOMContentLoaded", bootstrap);