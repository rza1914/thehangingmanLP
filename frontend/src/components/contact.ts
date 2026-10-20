import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { config } from "../config";

export interface ContactResult {
  ok: boolean;
  status?: number;
  message: string;
}

export function renderContact(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "contact";
  section.className = "contact";

  const apiBase = (config.apiBaseUrl || "http://localhost:8000").replace(/\/$/, "");
  const submitUrl = apiBase + "/contact";

  /* honeypot — kept, never submitted as a real field */
  const hpField = document.createElement("input");
  hpField.type = "text";
  hpField.name = "honeypot";
  hpField.className = "hp-field";
  hpField.tabIndex = -1;
  hpField.autocomplete = "off";
  hpField.setAttribute("aria-hidden", "true");
  hpField.style.cssText =
    "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";

  /* offline / online state */
  let isOffline = !navigator.onLine;
  let clearContactError: (() => void) | null = null;
  const setOffline = (offline: boolean): void => {
    isOffline = offline;
  };
  addEventListener("online", () => { setOffline(false); if (clearContactError) clearContactError(); }, { passive: true });
  addEventListener("offline", () => setOffline(true), { passive: true });

  const render = (): void => {
    const dict = i18n.getDict();
    const currentLocale = i18n.getLocale();
    const isRtl = currentLocale === "fa";

    /* Form */
    const form = document.createElement("form");
    form.className = "contact-form";
    form.noValidate = true;

    const buildInput = (): HTMLInputElement => {
      const el = document.createElement("input");
      el.className = "contact-field__input";
      if (isRtl) {
        el.style.fontFamily = "var(--font-fa)";
        el.style.fontWeight = "400";
      }
      el.addEventListener("input", clearFieldError);
      return el;
    };

    const clearFieldError = (e: Event): void => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!target) return;
      const field = target.parentElement as HTMLElement | null;
      if (!field) return;
      field.classList.remove("invalid");
      target.setAttribute("aria-invalid", "false");
      const err = field.querySelector(".field-err");
      if (err) err.setAttribute("hidden", "true");
    };

    const buildLabel = (text: string): HTMLLabelElement => {
      const label = document.createElement("label");
      label.className = "contact-field__label";
      label.innerText = text;
      if (isRtl) {
        label.style.fontFamily = "var(--font-fa)";
        label.style.fontSize = "14px";
        label.style.letterSpacing = "0";
        label.style.textTransform = "none";
      }
      return label;
    };

    const buildErr = (id: string, text: string): HTMLParagraphElement => {
      const err = document.createElement("p");
      err.className = "field-err";
      err.id = id;
      err.hidden = true;
      err.innerText = text;
      return err;
    };

    const buildField = (
      labelFor: string,
      labelText: string,
      input: HTMLInputElement | HTMLTextAreaElement,
      errId: string,
      errText: string
    ): HTMLDivElement => {
      const div = document.createElement("div");
      div.className = "field";
      const label = buildLabel(labelText);
      label.htmlFor = labelFor;
      input.id = labelFor;
      input.required = true;
      input.setAttribute("aria-describedby", errId);
      input.setAttribute("aria-invalid", "false");
      const err = buildErr(errId, errText);
      div.appendChild(label);
      div.appendChild(input);
      div.appendChild(err);
      return div;
    };

    // Name field
    const nameInput = buildInput();
    nameInput.type = "text";
    nameInput.name = "name";
    nameInput.autocomplete = "name";
    nameInput.inputMode = "text";
    nameInput.placeholder = t(dict, "contact.form.namePh");
    const nameDiv = buildField(
      "cf-name",
      t(dict, "contact.form.name"),
      nameInput,
      "cf-err-name",
      t(dict, "contact.err.required")
    );

    // Email field
    const emailInput = buildInput();
    emailInput.type = "email";
    emailInput.name = "email";
    emailInput.dir = "ltr";
    emailInput.autocomplete = "email";
    emailInput.spellcheck = false;
    emailInput.inputMode = "email";
    emailInput.placeholder = t(dict, "contact.form.emailPh");
    const emailDiv = buildField(
      "cf-email",
      t(dict, "contact.form.email"),
      emailInput,
      "cf-err-email",
      t(dict, "contact.err.email")
    );

    // Message field
    const msgTextarea = document.createElement("textarea");
    msgTextarea.className = "contact-field__textarea";
    if (isRtl) {
      msgTextarea.style.fontFamily = "var(--font-fa)";
      msgTextarea.style.fontWeight = "400";
    }
    msgTextarea.addEventListener("input", clearFieldError);
    msgTextarea.rows = 4;
    msgTextarea.required = true;
    msgTextarea.inputMode = "text";
    msgTextarea.placeholder = t(dict, "contact.form.messagePh");
    const msgDiv = buildField(
      "cf-msg",
      t(dict, "contact.form.message"),
      msgTextarea,
      "cf-err-msg",
      t(dict, "contact.err.message")
    );

    // Submit button
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "contact-submit contact-field__submit";
    submitBtn.innerText = t(dict, "contact.form.submit");
    submitBtn.disabled = false;

    // Form status — always present so aria-live works and its space is reserved
    // (no layout shift between idle / sending / success / error states).
    const formStatus = document.createElement("p");
    formStatus.className = "form-status";
    formStatus.setAttribute("role", "status");
    formStatus.setAttribute("aria-live", "polite");
    formStatus.textContent = "";

    const setStatus = (text: string, kind: "success" | "error" | "none"): void => {
      formStatus.textContent = text;
      formStatus.style.color =
        kind === "success"
          ? "rgba(255,255,255,0.9)"
          : kind === "error"
            ? "rgba(255,255,255,0.72)"
            : "var(--dim-soft)";
    };
    clearContactError = () => setStatus("", "none");

    const setSubmitting = (submitting: boolean): void => {
      submitBtn.disabled = submitting;
      submitBtn.innerText = submitting
        ? t(dict, "contact.form.sending")
        : t(dict, "contact.form.submit");
      if (!submitting) setStatus("", "none");
    };

    const showFieldError = (id: string): void => {
      const field = document.getElementById(id)?.parentElement as HTMLElement | null;
      if (!field) return;
      const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
      if (input) input.setAttribute("aria-invalid", "true");
      field.classList.add("invalid");
      const err = field.querySelector(".field-err");
      if (err) err.removeAttribute("hidden");
    };

    const validate = (): boolean => {
      let valid = true;
      let firstInvalid: HTMLElement | null = null;
      if (!nameInput.value.trim()) { showFieldError("cf-name"); valid = false; if (!firstInvalid) firstInvalid = nameInput; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        showFieldError("cf-email");
        valid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      }
      if (!msgTextarea.value || msgTextarea.value.trim().length < 10) {
        showFieldError("cf-msg");
        valid = false;
        if (!firstInvalid) firstInvalid = msgTextarea;
      }
      if (firstInvalid) firstInvalid.focus();
      return valid;
    };

    const handleSubmit = async (e: Event): Promise<void> => {
      e.preventDefault();
      if (isOffline) {
        setSubmitting(false);
        setStatus(t(dict, "contact.form.error"), "error");
        return;
      }
      if (!validate()) return;
      setSubmitting(true);
      try {
        const res = await fetch(submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: msgTextarea.value.trim(),
            honeypot: "",
            locale: currentLocale,
          }),
        });
        if (!res.ok) {
          let detail = t(dict, "contact.form.error");
          try {
            const body = (await res.json()) as { detail?: string };
            if (body.detail) detail = body.detail;
          } catch {
            /* ignore parse errors */
          }
          setStatus(detail, "error");
          setSubmitting(false);
          return;
        }
        setStatus(t(dict, "contact.form.success"), "success");
        form.reset();
        nameInput.value = "";
        emailInput.value = "";
        msgTextarea.value = "";
      } catch {
        setStatus(t(dict, "contact.form.error"), "error");
      } finally {
        setSubmitting(false);
      }
    };

    form.addEventListener("submit", handleSubmit);

    section.innerHTML = "";
    section.appendChild(hpField);
    form.appendChild(nameDiv);
    form.appendChild(emailDiv);
    form.appendChild(msgDiv);
    form.appendChild(submitBtn);
    form.appendChild(formStatus);
    section.appendChild(form);
  };

  render();
  i18n.onChange(render);
  return section;
}
