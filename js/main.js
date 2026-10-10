/* ============================================================
   The Hanging Man — main script (no dependencies)
   Part 1: bilingual core (i18n, language switching)
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.THM_CONFIG || {};
  var I18N = window.I18N || { en: {}, fa: {} };
  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
  var typingToken = 0;

  function t(key) {
    var dict = I18N[lang] || {};
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    if (Object.prototype.hasOwnProperty.call(I18N.en, key)) return I18N.en[key];
    return '';
  }

  /* ---------------- i18n core ---------------- */
  var I18N_SEL = '[data-i18n],[data-i18n-html],[data-i18n-ph],[data-i18n-alt],[data-i18n-aria]';

  function applyTranslations() {
    document.querySelectorAll(I18N_SEL).forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (k !== null) { el.innerHTML = t(k); return; } // authored strings only — safe
      k = el.getAttribute('data-i18n');
      if (k !== null) el.textContent = t(k);
      k = el.getAttribute('data-i18n-ph');
      if (k !== null) el.setAttribute('placeholder', t(k));
      k = el.getAttribute('data-i18n-alt');
      if (k !== null) el.setAttribute('alt', t(k));
      k = el.getAttribute('data-i18n-aria');
      if (k !== null) el.setAttribute('aria-label', t(k));
    });
  }

  /* Typed hero eyebrow — the one decorative animation; instant on
     language switches and for reduced-motion users. */
  function typeEyebrow(animate) {
    var el = document.querySelector('[data-typing]');
    if (!el) return;
    var text = t(el.getAttribute('data-i18n'));
    var token = ++typingToken;
    el.textContent = '';
    if (!animate || REDUCED) { el.textContent = text; return; }
    var caret = document.createElement('span');
    caret.className = 'caret';
    el.appendChild(caret);
    var i = 0;
    (function step() {
      if (token !== typingToken) return; // superseded by a language switch
      if (i >= text.length) { if (caret.parentNode) caret.parentNode.removeChild(caret); return; }
      el.insertBefore(document.createTextNode(text.charAt(i)), caret);
      i++;
      setTimeout(step, 18);
    })();
  }

  function updateYear() {
    var el = document.getElementById('footer-year');
    if (!el) return;
    var y = String(new Date().getFullYear());
    if (lang === 'fa') {
      try {
        y = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' })
              .format(new Date());
      } catch (e) { /* keep gregorian fallback */ }
    }
    el.textContent = y;
  }

  function applyLang(next, animateTyping) {
    lang = (next === 'fa') ? 'fa' : 'en';
    var root = document.documentElement;
    root.lang = lang;
    root.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');

    applyTranslations();
    typeEyebrow(animateTyping);

    document.title = t('doc.title');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t('doc.desc'));

    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });

    /* clear any stale form errors/messages from the previous language */
    document.querySelectorAll('.field-err').forEach(function (p) { p.hidden = true; });
    document.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
    var st = document.getElementById('form-status');
    if (st) st.hidden = true;

    updateYear();
    try { localStorage.setItem('thm-lang', lang); } catch (e) {}
  }

  /* language buttons (header + mobile panel) */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.lang-btn') : null;
    if (btn) applyLang(btn.getAttribute('data-lang'), false);
  });

  /* first paint: apply saved/default language */
  applyLang(lang, true);

  /* ---------------- mobile navigation ---------------- */
  var header = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function closeNav() {
    header.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q button');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------------- scroll reveal ---------------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || REDUCED) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  /* ---------------- logo fallback ----------------
     If assets/logo.png is missing, swap to the typographic mark.
     Uses capture phase so we catch the error event reliably. */
  function markMissing(img) {
    var holder = img.closest('.brand-mark') || img.closest('.logo-frame');
    if (holder) holder.classList.add('no-logo');
  }
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img && img.tagName === 'IMG' && img.hasAttribute && img.hasAttribute('data-logo')) {
      markMissing(img);
    }
  }, true);
  document.querySelectorAll('img[data-logo]').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  /* ---------------- contact channels from config ---------------- */
  function prettyHandle(kind, value) {
    if (!value) return '';
    if (kind === 'telegram') {
      var part = value.split('/').filter(Boolean).pop() || '';
      return part ? '@' + part.replace(/^@/, '') : value;
    }
    if (kind === 'whatsapp') {
      var digits = value.replace(/[^\d]/g, '');
      return digits ? '+' + digits : value;
    }
    if (kind === 'email') return value.replace(/^mailto:/i, '');
    return value;
  }
  ['telegram', 'whatsapp', 'email'].forEach(function (kind) {
    var value = (CFG.contacts || {})[kind];
    document.querySelectorAll('[data-channel="' + kind + '"]').forEach(function (li) {
      if (!value) { li.hidden = true; return; }
      var a = li.querySelector('a');
      if (a) {
        a.href = value;
        if (/^https?:/i.test(value)) { a.target = '_blank'; a.rel = 'noopener'; }
      }
      var handle = li.querySelector('.channel-handle');
      if (handle) handle.textContent = prettyHandle(kind, value);
      li.hidden = false;
    });
  });

  /* ---------------- inquiry form ---------------- */
  var form = document.getElementById('inquiry-form');
  var statusEl = document.getElementById('form-status');
  var submitBtn = document.getElementById('form-submit');

  function setStatus(kind, msg) {
    statusEl.className = 'form-status ' + kind;
    statusEl.textContent = msg;
    statusEl.hidden = false;
  }

  function errElFor(input) {
    return document.getElementById('err-' + input.id.replace(/^f-/, ''));
  }
  function setError(input, key) {
    var field = input.closest('.field');
    if (field) field.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    var err = errElFor(input);
    if (err) { err.textContent = t(key); err.hidden = false; }
  }
  function clearError(input) {
    var field = input.closest('.field');
    if (field) field.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    var err = errElFor(input);
    if (err) { err.hidden = true; err.textContent = ''; }
  }

  function validate() {
    var firstBad = null;
    var name = document.getElementById('f-name');
    var email = document.getElementById('f-email');
    var type = document.getElementById('f-type');
    var desc = document.getElementById('f-desc');

    [name, email, type, desc].forEach(clearError);

    if (!name.value.trim()) { setError(name, 'err.required'); firstBad = firstBad || name; }
    var ev = email.value.trim();
    if (!ev) { setError(email, 'err.required'); firstBad = firstBad || email; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ev)) {
      setError(email, 'err.email'); firstBad = firstBad || email;
    }
    if (!type.value) { setError(type, 'err.type'); firstBad = firstBad || type; }
    if (desc.value.trim().length < 10) { setError(desc, 'err.desc'); firstBad = firstBad || desc; }

    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  if (form) {
    form.addEventListener('input', function (e) {
      if (e.target.matches('input, select, textarea')) clearError(e.target);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (statusEl) statusEl.hidden = true;
      if (!validate()) return;

      var endpoint = (CFG.formEndpoint || '').trim();
      if (!endpoint) {
        /* Honest state: not configured yet — never fake a success. */
        setStatus('notice', t('form.notConfigured'));
        return;
      }

      var payload = { _language: lang };
      new FormData(form).forEach(function (v, k) { payload[k] = v; });

      submitBtn.disabled = true;
      submitBtn.textContent = t('form.sending');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setStatus('ok', t('form.success'));
        form.reset();
      })
      .catch(function () {
        setStatus('err', t('form.error'));
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = t('form.submit');
      });
    });
  }
})();