import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { config } from "../config";

export function renderContact(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "contact";
  section.className = "contact";

  const render = (): void => {
    const dict = i18n.getDict();
    const currentLocale = i18n.getLocale();
    const isRtl = currentLocale === "fa";

    const apiBase = config.apiBaseUrl || "http://localhost:8000";

    // honeypot
    const hpField = document.createElement("input");
    hpField.type = "text";
    hpField.name = "honeypot";
    hpField.className = "hp-field";
    hpField.tabIndex = -1;
    hpField.autocomplete = "off";
    hpField.setAttribute("aria-hidden", "true");
    hpField.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";

    // Form
    const form = document.createElement("form");
    form.className = "contact-form";
    form.noValidate = true;

    // Name field
    const nameDiv = document.createElement("div");
    nameDiv.className = "field";
    const nameLabel = document.createElement("label");
    nameLabel.htmlFor = "cf-name";
    nameLabel.innerText = t(dict, "contact.form.name");
    nameLabel.style.cssText = "display:block;font-size:12px;font-weight:400;letter-spacing:var(--track);text-transform:uppercase;color:var(--dim-soft);margin-bottom:8px";
    if (isRtl) {
      nameLabel.style.fontFamily = "var(--font-fa)";
      nameLabel.style.fontSize = "14px";
      nameLabel.style.letterSpacing = "0";
      nameLabel.style.textTransform = "none";
    }
    const nameInput = document.createElement("input");
    nameInput.id = "cf-name";
    nameInput.name = "name";
    nameInput.type = "text";
    nameInput.autocomplete = "name";
    nameInput.required = true;
    nameInput.placeholder = t(dict, "contact.form.namePh");
    nameInput.style.cssText = "width:100%;background:transparent;border:0;border-bottom:1px solid var(--hair);border-radius:0;color:#fff;font:300 17px var(--font-sans);padding:8px 0;transition:border-color .3s";
    if (isRtl) {
      nameInput.style.fontFamily = "var(--font-fa)";
      nameInput.style.fontWeight = "400";
    }
    nameInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement | null;
      if (!target) return;
      const field = target.parentElement as HTMLElement | null;
      if (!field) return;
      field.classList.remove("invalid");
      const err = field.querySelector(".field-err");
      if (err) err.setAttribute("hidden", "true");
    });
    const nameErr = document.createElement("p");
    nameErr.className = "field-err";
    nameErr.id = "cf-err-name";
    nameErr.hidden = true;
    nameErr.innerText = t(dict, "contact.err.required");
    nameDiv.appendChild(nameLabel);
    nameDiv.appendChild(nameInput);
    nameDiv.appendChild(nameErr);

    // Email field
    const emailDiv = document.createElement("div");
    emailDiv.className = "field";
    const emailLabel = document.createElement("label");
    emailLabel.htmlFor = "cf-email";
    emailLabel.innerText = t(dict, "contact.form.email");
    emailLabel.style.cssText = "display:block;font-size:12px;font-weight:400;letter-spacing:var(--track);text-transform:uppercase;color:var(--dim-soft);margin-bottom:8px";
    if (isRtl) {
      emailLabel.style.fontFamily = "var(--font-fa)";
      emailLabel.style.fontSize = "14px";
      emailLabel.style.letterSpacing = "0";
      emailLabel.style.textTransform = "none";
    }
    const emailInput = document.createElement("input");
    emailInput.id = "cf-email";
    emailInput.name = "email";
    emailInput.type = "email";
    emailInput.dir = "ltr";
    emailInput.autocomplete = "email";
    emailInput.spellcheck = false;
    emailInput.required = true;
    emailInput.placeholder = t(dict, "contact.form.emailPh");
    emailInput.style.cssText = "width:100%;background:transparent;border:0;border-bottom:1px solid var(--hair);border-radius:0;color:#fff;font:300 17px var(--font-sans);padding:8px 0;transition:border-color .3s";
    if (isRtl) {
      emailInput.style.fontFamily = "var(--font-fa)";
      emailInput.style.fontWeight = "400";
    }
    emailInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement | null;
      if (!target) return;
      const field = target.parentElement as HTMLElement | null;
      if (!field) return;
      field.classList.remove("invalid");
      const err = field.querySelector(".field-err");
      if (err) err.setAttribute("hidden", "true");
    });
    const emailErr = document.createElement("p");
    emailErr.className = "field-err";
    emailErr.id = "cf-err-email";
    emailErr.hidden = true;
    emailErr.innerText = t(dict, "contact.err.email");
    emailDiv.appendChild(emailLabel);
    emailDiv.appendChild(emailInput);
    emailDiv.appendChild(emailErr);

    // Message field
    const msgDiv = document.createElement("div");
    msgDiv.className = "field";
    const msgLabel = document.createElement("label");
    msgLabel.htmlFor = "cf-msg";
    msgLabel.innerText = t(dict, "contact.form.message");
    msgLabel.style.cssText = "display:block;font-size:12px;font-weight:400;letter-spacing:var(--track);text-transform:uppercase;color:var(--dim-soft);margin-bottom:8px";
    if (isRtl) {
      msgLabel.style.fontFamily = "var(--font-fa)";
      msgLabel.style.fontSize = "14px";
      msgLabel.style.letterSpacing = "0";
      msgLabel.style.textTransform = "none";
    }
    const msgTextarea = document.createElement("textarea");
    msgTextarea.id = "cf-msg";
    msgTextarea.name = "message";
    msgTextarea.rows = 4;
    msgTextarea.required = true;
    msgTextarea.placeholder = t(dict, "contact.form.messagePh");
    msgTextarea.style.cssText = "width:100%;background:transparent;border:0;border-bottom:1px solid var(--hair);border-radius:0;color:#fff;font:300 17px var(--font-sans);padding:8px 0;transition:border-color .3s;min-height:110px;resize:vertical";
    if (isRtl) {
      msgTextarea.style.fontFamily = "var(--font-fa)";
      msgTextarea.style.fontWeight = "400";
    }
    msgTextarea.addEventListener("input", (e) => {
      const target = e.target as HTMLTextAreaElement | null;
      if (!target) return;
      const field = target.parentElement as HTMLElement | null;
      if (!field) return;
      field.classList.remove("invalid");
      const err = field.querySelector(".field-err");
      if (err) err.setAttribute("hidden", "true");
    });
    const msgErr = document.createElement("p");
    msgErr.className = "field-err";
    msgErr.id = "cf-err-msg";
    msgErr.hidden = true;
    msgErr.innerText = t(dict, "contact.err.message");
    msgDiv.appendChild(msgLabel);
    msgDiv.appendChild(msgTextarea);
    msgDiv.appendChild(msgErr);

    // Submit button
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "contact-submit";
    submitBtn.innerText = t(dict, "contact.form.submit");
    submitBtn.style.cssText = "background:none;border:0;border-bottom:1px solid var(--hair-strong);color:#fff;font:400 14px var(--font-sans);letter-spacing:var(--track);padding:10px 2px;cursor:pointer;transition:border-color .3s,color .3s";
    submitBtn.disabled = false;

// Form status
    const formStatus = document.createElement("p");
    formStatus.className = "form-status";
    formStatus.setAttribute("role", "status");
    formStatus.setAttribute("aria-live", "polite");
    formStatus.hidden = true;
    form.appendChild(formStatus);

    section.innerHTML = "";
    section.appendChild(hpField);
    section.appendChild(form);
    // keep style element for label calibration (will be removed/adjusted after first render)
    setTimeout(() => {
      // style element is injected inline, no external element to remove
    }, 100);
  };

  render();
  i18n.onChange(render);
  return section;
}