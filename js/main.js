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

      if (pack.metaTitle) document.title = pack.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && pack.metaDescription) metaDesc.content = pack.metaDescription;

      if (select) select.value = l;
      document.documentElement.lang = l;

      initPricing(l);
      initPayments(l);
      initAppLinks();
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
  }

  initAppLinks();
  void initDownloadsFromGitHub();
  initMobileNav();
  initI18n();
})();
