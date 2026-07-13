/** MasPlanLot marketing site */
(function () {
  const cfg = window.MASPLANLOT_CONFIG || {};
  const P = cfg.PRICING || {};
  const D = cfg.DOWNLOADS || {};
  const V = cfg.VERSION || '0.4.0';
  const APP = cfg.APP_URL || 'http://localhost:3000';

  // Display currency follows UI language: ru → ₽, en → $, sr → dinars.
  const CURRENCY_BY_LANG = { ru: 'rub', en: 'usd', sr: 'rsd' };
  const GROUPING_BY_LANG = { ru: 'ru-RU', en: 'en-US', sr: 'sr-RS' };

  function fmtMoney(n, lang) {
    const grouped = n.toLocaleString(GROUPING_BY_LANG[lang] || 'ru-RU');
    const cur = CURRENCY_BY_LANG[lang] || 'rub';
    if (cur === 'rub') return grouped + ' ₽';
    if (cur === 'rsd') return grouped + ' дин.';
    return '$' + grouped;
  }

  function priceValue(product, period, lang) {
    const p = P[product];
    if (!p) return null;
    const cur = (CURRENCY_BY_LANG[lang] || 'rub').replace(/^\w/, (c) => c.toUpperCase());
    return p[period + cur];
  }

  function initAppLinks() {
    document.querySelectorAll('[data-app-link]').forEach((el) => {
      el.href = APP + el.getAttribute('data-app-link');
    });
  }

  function initPricing(lang) {
    const pack = (window.MASPLANLOT_I18N || {})[lang] || {};
    const monthSuffix = pack.periodMonth || '/мес';
    const yearSuffix = pack.periodYear || '/год';

    const map = [
      ['crm-month', 'crm', 'month', monthSuffix],
      ['crm-year', 'crm', 'year', yearSuffix],
    ];
    map.forEach(([key, product, period, suffix]) => {
      const val = priceValue(product, period, lang);
      document.querySelectorAll('[data-price="' + key + '"]').forEach((el) => {
        if (val == null) return;
        if (el.classList.contains('plan__price')) {
          el.innerHTML = fmtMoney(val, lang) + '<small>' + suffix + '</small>';
        } else if (el.classList.contains('pricing-card__amount')) {
          el.textContent = fmtMoney(val, lang) + suffix;
        } else {
          el.textContent = fmtMoney(val, lang) + suffix;
        }
      });
    });
  }

  function initPayments(lang) {
    const pay = cfg.PAYMENTS || {};
    const paypal = document.getElementById('buyPaypal');
    const yoomoney = document.getElementById('buyYoomoney');
    if (paypal && pay.paypal) paypal.href = pay.paypal;
    if (yoomoney) {
      yoomoney.hidden = lang !== 'ru';
      if (pay.yoomoney) yoomoney.href = pay.yoomoney;
    }
    const email = pay.licenseEmail || 'segalcomminc@gmail.com';
    document.querySelectorAll('.pay-after a[href^="mailto:"]').forEach((a) => {
      const subject =
        lang === 'ru'
          ? 'MasPlanLot CRM — лицензия'
          : lang === 'sr'
            ? 'MasPlanLot CRM — licenca'
            : 'MasPlanLot CRM — license';
      a.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject);
    });
  }

  function applyDownloadLinks(crm) {
    const map = [
      ['crmWin', crm?.win],
      ['crmMac', crm?.mac],
    ];
    map.forEach(([id, href]) => {
      const el = document.getElementById(id);
      if (el && href) el.href = href;
    });
  }

  function initDownloads() {
    applyDownloadLinks(D.crm);
    document.querySelectorAll('[data-version]').forEach((el) => {
      el.textContent = 'v' + V;
    });
  }

  async function initDownloadsFromGitHub() {
    if (typeof window.fetchMasPlanLotReleaseDownloads !== 'function') {
      initDownloads();
      return;
    }

    try {
      const latest = await window.fetchMasPlanLotReleaseDownloads();
      applyDownloadLinks(latest.crm);
      if (latest.version) {
        document.querySelectorAll('[data-version]').forEach((el) => {
          el.textContent = 'v' + latest.version;
        });
      }
    } catch {
      initDownloads();
    }
  }

  function initMobileNav() {
    const nav = document.getElementById('mobileNav');
    const open = document.getElementById('menuToggle');
    const close = document.getElementById('menuClose');
    if (!nav || !open) return;

    const setOpen = (on) => {
      nav.classList.toggle('is-open', on);
      nav.setAttribute('aria-hidden', on ? 'false' : 'true');
      document.body.style.overflow = on ? 'hidden' : '';
    };

    open.addEventListener('click', () => setOpen(true));
    close?.addEventListener('click', () => setOpen(false));
    nav.addEventListener('click', (e) => {
      if (e.target === nav) setOpen(false);
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }

  function initHeroGallery() {
    const gallery = document.getElementById('heroGallery');
    if (!gallery) return;

    const slides = Array.from(gallery.querySelectorAll('.hero__slide'));
    const dots = Array.from(gallery.querySelectorAll('.hero__dot'));
    if (slides.length < 2 || dots.length !== slides.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = 0;
    let timer = null;
    let pointerStart = null;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const selected = i === active;
        slide.classList.toggle('is-active', selected);
        slide.setAttribute('aria-hidden', selected ? 'false' : 'true');
      });
      dots.forEach((dot, i) => {
        const selected = i === active;
        dot.classList.toggle('is-active', selected);
        dot.setAttribute('aria-selected', selected ? 'true' : 'false');
        dot.tabIndex = selected ? 0 : -1;
      });
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (!reduceMotion && !document.hidden) {
        timer = window.setInterval(() => show(active + 1), 5500);
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    gallery.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      show(active + (event.key === 'ArrowRight' ? 1 : -1));
      dots[active].focus();
      start();
    });

    gallery.addEventListener('pointerdown', (event) => {
      pointerStart = event.clientX;
    });
    gallery.addEventListener('pointerup', (event) => {
      if (pointerStart == null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) < 45) return;
      show(active + (distance < 0 ? 1 : -1));
      start();
    });
    gallery.addEventListener('pointercancel', () => {
      pointerStart = null;
    });

    gallery.addEventListener('mouseenter', stop);
    gallery.addEventListener('mouseleave', start);
    gallery.addEventListener('focusin', stop);
    gallery.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    show(0);
    start();
  }

  function initSupportForm(getLang) {
    const form = document.getElementById('supportForm');
    if (!form) return;

    const emailEl = document.getElementById('supportEmail');
    const subjectEl = document.getElementById('supportSubject');
    const messageEl = document.getElementById('supportMessage');
    const errorEl = document.getElementById('supportError');
    const successEl = document.getElementById('supportSuccess');
    const submitBtn = document.getElementById('supportSubmit');
    const subjectHidden = document.getElementById('supportFormSubject');
    const nextHidden = document.getElementById('supportFormNext');
    const supportTo = (cfg.PAYMENTS || {}).licenseEmail || 'segalcomminc@gmail.com';

    form.action = 'https://formsubmit.co/' + supportTo;

    function pack() {
      const dict = window.MASPLANLOT_I18N || {};
      return dict[getLang()] || dict.ru || {};
    }

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.hidden = false;
      if (successEl) successEl.hidden = true;
    }

    function showSuccess() {
      if (errorEl) errorEl.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        const t = pack();
        if (t.supportSuccess) successEl.textContent = t.supportSuccess;
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('sent') === '1') {
      showSuccess();
      form.reset();
      const cleanUrl = window.location.pathname + (window.location.hash || '#support');
      window.history.replaceState(null, '', cleanUrl);
      document.getElementById('support')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const t = pack();

      const email = (emailEl?.value || '').trim();
      const subject = (subjectEl?.value || '').trim();
      const message = (messageEl?.value || '').trim();

      if (!email) {
        showError(t.supportEmailRequired || 'Email required');
        emailEl?.focus();
        return;
      }
      if (!email.includes('@')) {
        showError(t.supportEmailInvalid || 'Invalid email');
        emailEl?.focus();
        return;
      }
      if (!subject) {
        showError(t.supportSubjectRequired || 'Subject required');
        subjectEl?.focus();
        return;
      }
      if (!message) {
        showError(t.supportMessageRequired || 'Message required');
        messageEl?.focus();
        return;
      }

      if (errorEl) errorEl.hidden = true;
      if (successEl) successEl.hidden = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t.supportSending || 'Sending…';
      }

      if (subjectHidden) subjectHidden.value = '[MasPlanLot] ' + subject;
      if (nextHidden) {
        const base = window.location.origin + window.location.pathname;
        nextHidden.value = base + '?sent=1#support';
      }

      form.submit();
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function initI18n() {
    const dict = window.MASPLANLOT_I18N || {};
    const select = document.getElementById('siteLang');
    let lang = 'ru';
    try {
      lang = localStorage.getItem('site_lang') || lang;
    } catch {
      /* ignore */
    }

    const getLang = () => lang;

    function apply(l) {
      const pack = dict[l] || dict.ru;

      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key && pack[key] != null) el.textContent = pack[key];
      });

      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        if (key && pack[key] != null) el.innerHTML = pack[key];
      });

      document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.getAttribute('data-i18n-aria');
        if (key && pack[key] != null) el.setAttribute('aria-label', pack[key]);
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key && pack[key] != null) el.setAttribute('placeholder', pack[key]);
      });

      if (pack.metaTitle) document.title = pack.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && pack.metaDescription) metaDesc.content = pack.metaDescription;

      if (select) select.value = l;
      document.documentElement.lang = l;

      initPricing(l);
      initPayments(l);
      initAppLinks();

      const submitBtn = document.getElementById('supportSubmit');
      if (submitBtn && pack.supportSend) submitBtn.textContent = pack.supportSend;
    }

    apply(lang);
    select?.addEventListener('change', () => {
      lang = select.value;
      try {
        localStorage.setItem('site_lang', lang);
      } catch {
        /* ignore */
      }
      apply(lang);
    });

    initSupportForm(getLang);
  }

  initAppLinks();
  void initDownloadsFromGitHub();
  initMobileNav();
  initHeroGallery();
  initI18n();
})();
