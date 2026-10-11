import "./styles/variables.css";
import "./styles/base.css";
import "./styles/components.css";

import { I18nStore } from "./i18n/i18n";
import { renderHeader } from "./components/header";
import { renderHero } from "./components/hero";
import { renderServices } from "./components/services";
import { renderApproach } from "./components/approach";
import { BlueprintLines } from "./utils/blueprintLines";
import { config } from "./config";

function bootstrap(): void {
  const app = document.getElementById("app");
  if (!app) {
    throw new Error("Root element #app not found");
  }

  const i18n = new I18nStore(config.defaultLocale);
  i18n.init();

  app.appendChild(renderHeader(i18n));

  const blueprintZone = document.createElement("div");
  blueprintZone.id = "blueprint-zone";

  const hero = renderHero(i18n);
  const services = renderServices(i18n);
  const approach = renderApproach(i18n);

  blueprintZone.appendChild(hero);
  blueprintZone.appendChild(services);
  blueprintZone.appendChild(approach);

  app.appendChild(blueprintZone);

  const groups = [
    { headingId: "services-heading", itemIds: ["service-row-0", "service-row-1", "service-row-2", "service-row-3"] },
    { headingId: "approach-heading", itemIds: ["approach-step-0", "approach-step-1", "approach-step-2", "approach-step-3"] }
  ];

  const blueprint = new BlueprintLines(blueprintZone, groups);

  i18n.onChange(() => {
    blueprint.recompute();
  });
}

document.addEventListener("DOMContentLoaded", bootstrap);