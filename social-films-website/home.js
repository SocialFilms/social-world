/* Social Films — home: play films in a lightbox */
(function () {
  'use strict';
  var dialog = document.querySelector('.player');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var frame = dialog.querySelector('.player-frame');
  var lastTrigger = null;

  function open(id, title, trigger) {
    lastTrigger = trigger;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    iframe.title = title || 'Video';
    frame.replaceChildren(iframe);
    dialog.showModal();
  }
  function close() { dialog.close(); }

  dialog.addEventListener('close', function () {
    frame.replaceChildren();
    if (lastTrigger) lastTrigger.focus();
  });
  dialog.querySelector('.player-close').addEventListener('click', close);
  dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });

  document.querySelectorAll('button[data-vimeo]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-vimeo');
      if (!id) return; // brand video placeholder: nothing to play yet
      open(id, btn.getAttribute('data-title'), btn);
    });
  });
})();

/* Social Films — home: endless auto-scrolling row ("One trip. A whole campaign.")
   Scrolls on its own and loops forever. Visitors can still drag it with a mouse or
   swipe it on a phone; it pauses while they interact and resumes a few seconds later. */
(function () {
  'use strict';
  var rail = document.querySelector('.rail--auto');
  if (!rail) return;
  var originals = Array.prototype.slice.call(rail.children);
  if (originals.length < 2) return;

  // Copy the boxes so the row can wrap around without a visible jump.
  // Copies are hidden from screen readers and skipped by the keyboard.
  for (var n = 0; n < 2; n++) {
    originals.forEach(function (el) {
      var copy = el.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('data-copy', '');
      copy.querySelectorAll('a, button').forEach(function (f) { f.tabIndex = -1; });
      rail.appendChild(copy);
    });
  }

  var setWidth = 0;            // width of one full set of boxes, including the gap
  function measure() { setWidth = rail.children[originals.length].offsetLeft - originals[0].offsetLeft; }
  measure();
  window.addEventListener('resize', measure);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = 24;              // pixels per second
  var last = 0;
  var pos = rail.scrollLeft;
  var pausedUntil = 0, hovering = false, dragging = false, visible = true;

  function wrap() {            // keep the position inside the middle copy so both directions loop
    if (!setWidth) return;
    if (rail.scrollLeft >= setWidth * 2) rail.scrollLeft -= setWidth;
    else if (rail.scrollLeft < 1) rail.scrollLeft += setWidth;
  }
  function pause(ms) { pausedUntil = Date.now() + (ms || 3000); }

  rail.addEventListener('scroll', function () {
    if (dragging) return;
    // the browser rounds scrollLeft, so only treat bigger jumps as the visitor scrolling
    if (Math.abs(rail.scrollLeft - pos) > 2) { wrap(); pos = rail.scrollLeft; }
  }, { passive: true });
  rail.addEventListener('mouseenter', function () { hovering = true; });
  rail.addEventListener('mouseleave', function () { hovering = false; pause(1500); });
  rail.addEventListener('touchstart', function () { pause(4000); }, { passive: true });
  rail.addEventListener('touchmove', function () { pause(4000); }, { passive: true });
  rail.addEventListener('wheel', function () { pause(3000); }, { passive: true });
  rail.addEventListener('focusin', function () { pause(6000); });

  // Mouse: click and drag to scroll
  var startX = 0, startLeft = 0, moved = false;
  rail.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    rail.scrollLeft = startLeft - dx;
    if (rail.scrollLeft >= setWidth * 2) { rail.scrollLeft -= setWidth; startLeft -= setWidth; }
    else if (rail.scrollLeft < 1) { rail.scrollLeft += setWidth; startLeft += setWidth; }
    pos = rail.scrollLeft;
  });
  function endDrag() { if (!dragging) return; dragging = false; rail.classList.remove('is-dragging'); pause(2500); }
  rail.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);
  rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

  // Only animate while the row is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(rail);
  }

  if (reduce) return;          // visitors who prefer less motion can still scroll by hand
  rail.scrollLeft = pos = setWidth; // start in the middle copy
  function tick(now) {
    var dt = last ? Math.min(now - last, 100) : 0;   // ms since last frame, capped so it never jumps
    last = now;
    if (visible && !hovering && !dragging && Date.now() > pausedUntil && setWidth) {
      pos += SPEED * dt / 1000;
      if (pos >= setWidth * 2) pos -= setWidth;
      rail.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
