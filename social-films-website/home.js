/* Social Films — home: play films in a lightbox */
(function () {
  'use strict';
  var dialog = document.querySelector('.player');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var frame = dialog.querySelector('.player-frame');
  var lastTrigger = null;

  // Vimeo films use data-vimeo="ID"; YouTube films use data-youtube="ID".
  // YouTube plays from youtube-nocookie.com with related videos from other channels and annotations turned off.
  function open(id, title, trigger, source) {
    lastTrigger = trigger;
    var iframe = document.createElement('iframe');
    iframe.src = source === 'youtube'
      ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&iv_load_policy=3&color=white'
      : 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1';
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

  document.querySelectorAll('button[data-vimeo], button[data-youtube]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var yt = btn.getAttribute('data-youtube');
      var id = yt || btn.getAttribute('data-vimeo');
      if (!id) return; // placeholder: nothing to play yet
      open(id, btn.getAttribute('data-title'), btn, yt ? 'youtube' : 'vimeo');
    });
  });
})();

/* Social Films — home: endless auto-scrolling row ("Social Films" and "One trip, a whole campaign")
   Scrolls on its own and loops forever. Visitors can still drag it with a mouse or
   swipe it on a phone; it pauses while they interact and resumes a few seconds later. */
(function () {
  'use strict';
  document.querySelectorAll('.rail--auto').forEach(setup);

  function setup(rail) {
  var originals = Array.prototype.slice.call(rail.children);
  if (originals.length < 2) return;

  // Copy the boxes so the row can wrap around without a visible jump.
  // Copies are hidden from screen readers and skipped by the keyboard.
  for (var n = 0; n < 2; n++) {
    originals.forEach(function (el) {
      var copy = el.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('data-copy', '');
      if (copy.matches('a, button')) copy.tabIndex = -1;
      copy.querySelectorAll('a, button').forEach(function (f) { f.tabIndex = -1; });
      // a copied film still plays its film: pass the click on to the original
      if (el.matches('button[data-vimeo], button[data-youtube]')) copy.addEventListener('click', function () { el.click(); });
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
  });
  rail.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    // only grab the mouse once it really drags, so a simple click still opens a film
    if (!moved && Math.abs(dx) > 3) { moved = true; try { rail.setPointerCapture(e.pointerId); } catch (err) {} }
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
  }
})();

/* Social Films — home: loop the background film early.
   An iframe with data-loop-end="48" jumps back to the start at 48 seconds,
   before the film's closing title card. Change the number to move the loop point. */
(function () {
  'use strict';
  document.querySelectorAll('iframe[data-loop-end]').forEach(function (frame) {
    var end = parseFloat(frame.getAttribute('data-loop-end'));
    if (!end) return;
    var seeking = false;
    function send(method, value) {
      if (!frame.contentWindow) return;
      var msg = { method: method };
      if (value !== undefined) msg.value = value;
      frame.contentWindow.postMessage(JSON.stringify(msg), 'https://player.vimeo.com');
    }
    function listen() { send('addEventListener', 'timeupdate'); send('addEventListener', 'playProgress'); }
    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://player.vimeo.com' || e.source !== frame.contentWindow) return;
      var d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
      if (!d) return;
      if (d.event === 'ready') { listen(); return; }
      if ((d.event === 'timeupdate' || d.event === 'playProgress') && d.data) {
        var t = d.data.seconds;
        if (t >= end && !seeking) { seeking = true; send('setCurrentTime', 0); send('play'); }
        else if (t < end - 1) { seeking = false; }
      }
    });
    frame.addEventListener('load', listen);
    listen();
  });
})();

/* Social Films — phones and tablets: open and close the menu (☰) */
(function () {
  "use strict";
  document.querySelectorAll(".menu-toggle").forEach(function (btn) {
    var bar = btn.closest(".topbar, .nav");
    if (!bar) return;
    function set(open) {
      bar.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); set(!bar.classList.contains("menu-open")); });
    // a link in the menu closes it (important for links to sections on the same page)
    bar.querySelectorAll("#site-menu a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && bar.classList.contains("menu-open")) { set(false); btn.focus(); } });
    document.addEventListener("click", function (e) { if (bar.classList.contains("menu-open") && !bar.contains(e.target)) set(false); });
  });
})();

// ── Upcoming missions carousel: moves to the next mission every 20 seconds ──
(function () {
  var box = document.querySelector('.mission-carousel');
  if (!box) return;
  var track = box.querySelector('.mc-track');
  var slides = Array.prototype.slice.call(track.children);
  if (slides.length < 2) return;
  var i = 0, timer = null, held = false;
  function show(n) {
    i = (n + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-100 * i) + '%)';
    slides.forEach(function (s, k) {
      var on = k === i;
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.querySelectorAll('a, button').forEach(function (el) { el.tabIndex = on ? 0 : -1; });
    });
  }
  function restart() { clearInterval(timer); timer = setInterval(function () { if (!held && !document.hidden) show(i + 1); }, 20000); }
  box.querySelector('.mc-prev').addEventListener('click', function () { show(i - 1); restart(); });
  box.querySelector('.mc-next').addEventListener('click', function () { show(i + 1); restart(); });
  box.addEventListener('mouseenter', function () { held = true; });
  box.addEventListener('mouseleave', function () { held = false; });
  box.addEventListener('focusin', function () { held = true; });
  box.addEventListener('focusout', function () { held = false; });
  // swipe on phones
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) { show(dx < 0 ? i + 1 : i - 1); restart(); }
  }, { passive: true });
  show(0);
  restart();
})();
