/**
 * Ping-pong marquee for clipped header titles.
 *
 * Uses the native scrollLeft property on the overflow:hidden container.
 * Overflow detection is simply  el.scrollWidth > el.clientWidth — no
 * inner-span wrappers or transform tricks needed.
 *
 * Configurable via CSS custom properties:
 *   --ub-marquee-speed      scroll speed in px/sec  (default 40)
 *   --ub-marquee-pause-ms   pause at each end in ms (default 1200)
 *
 * Handles Material for MkDocs instant navigation by observing the header
 * for DOM mutations (element replacement) and text mutations (content swap
 * without replacement), as well as pushState / popstate navigation.
 */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root   = document.documentElement;
  const SPEED  = (parseFloat(getComputedStyle(root).getPropertyValue('--ub-marquee-speed'))  || 0) || 40;
  const PAUSE  = (parseInt(getComputedStyle(root).getPropertyValue('--ub-marquee-pause-ms'), 10) || 0) || 1200;

  /* Per-element instance registry so we can re-check without re-initialising */
  const registry = new WeakMap(); // el → { stop, check }

  function initEl(el) {
    /* ---- If already init'd, just re-check (handles text-only mutations) ---- */
    if (el.dataset.ubMarquee) {
      const inst = registry.get(el);
      if (inst) { inst.stop(); requestAnimationFrame(inst.check); }
      return;
    }
    el.dataset.ubMarquee = '1';

    /* ---- clean up DOM left by earlier marquee versions ---- */
    const oldInner = el.querySelector('.ub-marquee-inner');
    if (oldInner) el.textContent = oldInner.textContent;
    const oldTrack = el.querySelector('.marquee-track');
    if (oldTrack) {
      const items = oldTrack.querySelectorAll('.marquee-item');
      el.textContent = items.length ? items[0].textContent : oldTrack.textContent;
    }

    /* ---- animation state ---- */
    let raf   = null;
    let prev  = 0;
    let pos   = 0;
    let dir   = 1;
    let going = false;

    function maxScroll() {
      return Math.max(0, el.scrollWidth - el.clientWidth);
    }

    function tick(ts) {
      if (!going) return;
      if (!prev) { prev = ts; raf = requestAnimationFrame(tick); return; }
      const dt = (ts - prev) / 1000;
      prev = ts;
      pos += SPEED * dt * dir;
      const mx = maxScroll();

      if (dir === 1 && pos >= mx) {
        pos = mx;
        el.scrollLeft = pos;
        going = false;
        setTimeout(() => { dir = -1; prev = 0; going = true; raf = requestAnimationFrame(tick); }, PAUSE);
        return;
      }
      if (dir === -1 && pos <= 0) {
        pos = 0;
        el.scrollLeft = 0;
        going = false;
        setTimeout(() => { dir = 1; prev = 0; going = true; raf = requestAnimationFrame(tick); }, PAUSE);
        return;
      }

      el.scrollLeft = pos;
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (going) return;
      if (maxScroll() < 2) return;
      going = true;
      prev  = 0;
      raf   = requestAnimationFrame(tick);
    }

    function stop() {
      going = false;
      if (raf) cancelAnimationFrame(raf);
      raf  = null;
      pos  = 0;
      dir  = 1;
      prev = 0;
      el.scrollLeft = 0;
    }

    function check() {
      if (maxScroll() > 2) {
        el.classList.add('is-marquee');
        start();
      } else {
        el.classList.remove('is-marquee');
        stop();
      }
    }

    registry.set(el, { stop, check });

    /* ---- resize observer ---- */
    if (window.ResizeObserver) {
      new ResizeObserver(() => { stop(); requestAnimationFrame(check); }).observe(el);
    } else {
      window.addEventListener('resize', () => { stop(); requestAnimationFrame(check); });
    }

    requestAnimationFrame(check);
    setTimeout(check, 600);
  }

  /* Initialise all current .md-ellipsis elements inside the header title */
  function scan() {
    document.querySelectorAll('.md-header__title .md-ellipsis').forEach(initEl);
  }

  function wireNavigation() {
    /* MutationObserver on the header title area covers two cases:
       1. childList  → Material replaces the .md-ellipsis element entirely
       2. characterData (subtree) → Material swaps text in-place without
          replacing the element; ResizeObserver won't fire in this case */
    const titleEl = document.querySelector('.md-header__title');
    if (titleEl && window.MutationObserver) {
      new MutationObserver(() => scan())
        .observe(titleEl, { childList: true, subtree: true, characterData: true });
    }

    /* Belt-and-suspenders: also catch pushState / popstate navigations */
    const _push = history.pushState;
    history.pushState = function () {
      _push.apply(this, arguments);
      setTimeout(scan, 80);
    };
    window.addEventListener('popstate', () => setTimeout(scan, 80));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { scan(); wireNavigation(); });
  } else {
    scan();
    wireNavigation();
  }
})();
