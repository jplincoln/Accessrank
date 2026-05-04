/* ==================================================================
   ACCESSRANK — BEHAVIOR
   ==================================================================
   Most of what you'll want to edit lives in CONFIG below. The audit
   widget logic underneath shouldn't need to change unless you're
   adding new functionality.
   ================================================================== */


/* ------------------------------------------------------------------
   CONFIG — edit these to change audit content & timing
   ------------------------------------------------------------------ */
const CONFIG = {

  /* Rows that animate into the live audit panel. Add/remove freely.
     The numeric portion of `meta` is summed to produce the
     "X issues found" total at the end. */
  auditItems: [
    { label: 'Color contrast (1.4.3)',          meta: '14 fixes' },
    { label: 'Alt text + image SEO (1.1.1)',    meta: '42 fixes' },
    { label: 'Heading hierarchy (1.3.1)',       meta: '9 fixes'  },
    { label: 'Core Web Vitals',                 meta: '+18 pts'  },
    { label: 'Form labels + ARIA (3.3.2)',      meta: '23 fixes' },
    { label: 'Schema markup',                   meta: '+12 types' }
  ],

  /* Status messages that cycle while scanning. */
  scanStatuses: [
    'crawling pages...',
    'checking WCAG 2.2 AA...',
    'analyzing Core Web Vitals...',
    'scoring SEO signals...',
    'compiling report...'
  ],

  /* Default URL used if the user hits Scan with the input empty,
     and used for the auto-demo on first page load. */
  defaultUrl: 'example.shop',

  /* Timing (milliseconds). */
  rowStaggerMs:    450,    /* Delay between each audit row appearing */
  initialDelayMs:  700,    /* Delay before the first row appears */
  statusCycleMs:   600,    /* How fast scan-status messages rotate */
  autoDemoDelayMs: 800     /* Wait before auto-running the demo */
};


/* ------------------------------------------------------------------
   AUDIT WIDGET
   ------------------------------------------------------------------ */
(function initAuditWidget() {
  const urlInput  = document.getElementById('audit-url');
  const scanBtn   = document.getElementById('audit-scan');
  const statusEl  = document.getElementById('audit-status');
  const rowsEl    = document.getElementById('audit-rows');
  const emptyEl   = document.getElementById('audit-empty');
  const metaEl    = document.getElementById('audit-meta');
  const reportBtn = document.getElementById('audit-report');

  if (!urlInput || !scanBtn) return; // safety guard

  let isScanning = false;

  function startScan() {
    if (isScanning) return;

    let url = urlInput.value.trim();
    if (!url) {
      url = CONFIG.defaultUrl;
      urlInput.value = url;
    }

    isScanning = true;
    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning';

    if (emptyEl) emptyEl.style.display = 'none';
    rowsEl.innerHTML = '';
    metaEl.textContent = url;

    /* Cycle scan status messages */
    let statusIdx = 0;
    statusEl.classList.add('active');
    statusEl.innerHTML = `<span class="scan-spinner"></span><span>${CONFIG.scanStatuses[0]}</span>`;

    const statusTimer = setInterval(function () {
      statusIdx++;
      if (statusIdx < CONFIG.scanStatuses.length) {
        statusEl.innerHTML = `<span class="scan-spinner"></span><span>${CONFIG.scanStatuses[statusIdx]}</span>`;
      }
    }, CONFIG.statusCycleMs);

    /* Stagger the audit rows in */
    CONFIG.auditItems.forEach(function (item, i) {
      setTimeout(function () {
        const row = document.createElement('div');
        row.className = 'audit-row';
        row.innerHTML = `
          <span class="check-circle">
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <path class="check-anim" d="M2 5.5 L4.5 8 L9 3"
                fill="none" stroke="#0E0E10" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="row-label">${item.label}</span>
          <span class="row-meta">${item.meta}</span>
        `;
        rowsEl.appendChild(row);
        requestAnimationFrame(function () { row.classList.add('visible'); });
      }, CONFIG.initialDelayMs + i * CONFIG.rowStaggerMs);
    });

    /* When all rows have appeared, finalize the scan */
    const totalDuration = CONFIG.initialDelayMs + CONFIG.auditItems.length * CONFIG.rowStaggerMs + 300;

    setTimeout(function () {
      clearInterval(statusTimer);
      statusEl.classList.remove('active');

      const total = CONFIG.auditItems.reduce(function (acc, item) {
        const n = parseInt(item.meta.replace(/\D/g, ''), 10) || 0;
        return acc + n;
      }, 0);

      statusEl.innerHTML = `<span style="color: #FFD23F;">●</span><span>scan complete · ${total} issues found</span>`;

      isScanning = false;
      scanBtn.disabled = false;
      scanBtn.textContent = 'Rescan →';
    }, totalDuration);
  }

  /* Wire up events */
  scanBtn.addEventListener('click', startScan);
  urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') startScan();
  });

  reportBtn.addEventListener('click', function () {
    /* Replace this with your real report-generation call.
       Default behavior: scroll to the form / open a modal / etc. */
    alert('Report generation goes here. Hook this up to your backend.');
  });

  /* Auto-run a demo scan on first load so the page isn't empty */
  setTimeout(function () {
    if (!urlInput.value && !isScanning) {
      urlInput.value = CONFIG.defaultUrl;
      startScan();
    }
  }, CONFIG.autoDemoDelayMs);
})();


/* ------------------------------------------------------------------
   MOBILE MENU TOGGLE
   ------------------------------------------------------------------ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobile-menu');

  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', function () {
    const open = menu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  });

  /* Close menu when any link inside it is clicked */
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });
})();


/* ------------------------------------------------------------------
   SMOOTH-SCROLL HELPERS for the WCAG-explained buttons
   ------------------------------------------------------------------ */
(function initWcagAnchors() {
  const wcagSection = document.getElementById('wcag');
  if (!wcagSection) return;

  ['wcag-link', 'wcag-footer'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        wcagSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
})();
