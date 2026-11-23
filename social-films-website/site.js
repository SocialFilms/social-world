/* Social Films — shared behaviour */
(function () {
  'use strict';

  // ── Click-to-play Vimeo and YouTube facades ──────────────────────
  // No iframe loads until the user hits play, keeping pages light.
  document.querySelectorAll('.video').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.dataset.playing) return;
      el.dataset.playing = '1';
      var yt = el.getAttribute('data-youtube');
      var id = yt || el.getAttribute('data-vimeo');
      var iframe = document.createElement('iframe');
      iframe.src = yt
        ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&iv_load_policy=3&color=white'
        : 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.title = el.getAttribute('aria-label') || 'Video';
      el.appendChild(iframe);
      var play = el.querySelector('.play');
      if (play) play.style.display = 'none';
      var featured = el.closest('.featured');
      if (featured) featured.classList.add('is-playing');
    });
  });

  // ── Work page showcase: pick a film from the row, play it in the big banner ──
  var show = document.querySelector('.showcase');
  if (show) {
    var bg = show.querySelector('.showcase-bg');
    var player = show.querySelector('.showcase-player');
    var closeBtn = show.querySelector('.showcase-close');
    var tiles = document.querySelectorAll('.tile[data-youtube]');
    var stopFilm = function () {
      var f = player.querySelector('iframe'); if (f) f.remove();
      player.hidden = true;
    };
    var playFilm = function () {
      stopFilm();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + show.getAttribute('data-youtube') + '?autoplay=1&rel=0&playsinline=1&iv_load_policy=3&color=white';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      f.title = show.querySelector('.showcase-title').textContent;
      player.appendChild(f);
      player.hidden = false;
    };
    show.querySelector('.showcase-play').addEventListener('click', playFilm);
    closeBtn.addEventListener('click', stopFilm);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !player.hidden) stopFilm(); });
    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () {
        stopFilm();
        tiles.forEach(function (t) { t.removeAttribute('aria-current'); });
        tile.setAttribute('aria-current', 'true');
        var id = tile.getAttribute('data-youtube');
        show.setAttribute('data-youtube', id);
        show.querySelector('.showcase-title').textContent = tile.getAttribute('data-title');
        show.querySelector('.showcase-tag').textContent = tile.getAttribute('data-tag');
        show.querySelector('.showcase-where').textContent = tile.getAttribute('data-meta');
        show.querySelector('.showcase-desc').textContent = tile.getAttribute('data-desc');
        bg.classList.add('is-swapping');
        var next = new Image();
        next.onload = function () { bg.src = next.src; bg.classList.remove('is-swapping'); };
        next.src = tile.querySelector('img').src;
        show.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ── Work page film row: on phones it scrolls by itself, like the home page row ──
  var row = document.querySelector('.shelf-row');
  if (row) {
    var originals = Array.prototype.slice.call(row.children);
    for (var n = 0; n < 2; n++) {
      originals.forEach(function (el) {
        var copy = el.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('data-copy', '');
        copy.removeAttribute('aria-current');
        copy.tabIndex = -1;
        copy.addEventListener('click', function () { el.click(); });   // a copy plays its original
        row.appendChild(copy);
      });
    }
    var phone = window.matchMedia('(max-width: 760px)');
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var setW = 0, rowPos = 0, rowLast = 0, rowPaused = 0;
    var measureRow = function () { setW = phone.matches ? row.children[originals.length].offsetLeft - originals[0].offsetLeft : 0; };
    var hold = function (ms) { rowPaused = Date.now() + ms; };
    measureRow();
    window.addEventListener('resize', measureRow);
    row.addEventListener('touchstart', function () { hold(4000); }, { passive: true });
    row.addEventListener('touchmove', function () { hold(4000); }, { passive: true });
    row.addEventListener('scroll', function () {
      if (Math.abs(row.scrollLeft - rowPos) > 2) {
        if (setW && row.scrollLeft >= setW * 2) row.scrollLeft -= setW;
        else if (setW && row.scrollLeft < 1) row.scrollLeft += setW;
        rowPos = row.scrollLeft;
      }
    }, { passive: true });
    var step = function (t) {
      var dt = rowLast ? Math.min(t - rowLast, 100) / 1000 : 0;
      rowLast = t;
      if (setW && !calm && Date.now() > rowPaused) {
        rowPos += 24 * dt;
        if (rowPos >= setW * 2) rowPos -= setW;
        row.scrollLeft = rowPos;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── Category filter (Work page) ──────────────────────
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      var f = chip.getAttribute('data-filter');
      cards.forEach(function (card) {
        var match = f === 'all' || card.getAttribute('data-category') === f;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  // ── Hero reel: sound toggle + reduced-motion respect ──
  var reel = document.querySelector('.hero-reel video');
  var toggle = document.querySelector('.sound-toggle');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reel) {
    reel.muted = true;
    if (still) { reel.removeAttribute('autoplay'); reel.pause(); }
    else reel.play().catch(function () {});
  }
  if (reel && toggle) {
    toggle.addEventListener('click', function () {
      var on = reel.muted;                 // turning sound ON
      reel.muted = !on;
      if (on) reel.play().catch(function () {});
      toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      toggle.querySelector('.label').textContent = on ? 'Sound on' : 'Watch with sound';
    });
  }

  // ── Contact forms: no backend yet, so hand the message to the visitor's mail app ──
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ''; };
      var name = [v('first'), v('last')].filter(Boolean).join(' ');
      var body = v('message') + '\n\n— ' + name + (v('org') ? ', ' + v('org') : '') + '\n' + v('email');
      var href = 'mailto:info@socialfilms.ca?subject=' + encodeURIComponent('Project enquiry from ' + name) +
        '&body=' + encodeURIComponent(body);
      window.location.href = href;
      var note = form.querySelector('.form-note');
      if (note) {
        note.innerHTML = 'Your email app should open with the message ready to send. Nothing opened? Write to <a href="mailto:info@socialfilms.ca">info@socialfilms.ca</a>.';
        note.hidden = false;
      }
    });
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
