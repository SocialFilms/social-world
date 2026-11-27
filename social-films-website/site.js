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

  // ── Film preview window (Work and Studio pages): opens on click and plays straight away ──
  // One list of films for every page. To add a film, add it here and as a tile in work.html.
  var FILMS = [
    { id: '1qZLS0R7xnE', title: 'Amal', tag: 'NON-PROFIT', meta: 'Mission film · Marrakech, Morocco',
      desc: 'A mission film for Amal, a non-profit in Marrakech, Morocco.',
      img: 'https://i.ytimg.com/vi/1qZLS0R7xnE/maxresdefault.jpg' },
    { id: 'lx7WtMI8dM4', title: 'Relais & Châteaux', tag: 'HOSPITALITY', meta: 'Relais & Châteaux × non-profit Pack for a Purpose · Galápagos, Ecuador',
      desc: 'Hospitality meets purpose: Relais & Châteaux and the non-profit Pack for a Purpose, filmed together in the Galápagos, Ecuador.',
      img: 'https://i.ytimg.com/vi/lx7WtMI8dM4/maxresdefault.jpg' },
    { id: 'adBSNQKS7Aw', title: 'Choices for Youth', tag: 'DOCU-SERIES', meta: 'Canadian Medical Association · St. John’s, Newfoundland',
      desc: 'A docu-series with the Canadian Medical Association, filmed in St. John’s, Newfoundland.',
      img: 'assets/home/choices-for-youth.webp' },
    { id: '3RZTWwOD4mw', title: 'Selina', tag: 'DESTINATION', meta: 'Selina × Amal · Post-earthquake tourism film · Morocco',
      desc: 'Selina × Amal: a post-earthquake tourism film from Morocco.',
      img: 'assets/home/selina.webp' }
  ];
  var filmById = function (id) { return FILMS.filter(function (f) { return f.id === id; })[0]; };
  var triggers = document.querySelectorAll('[data-film]');
  if (triggers.length) {
    var pv = document.createElement('div');
    pv.className = 'pv'; pv.id = 'preview'; pv.hidden = true;
    pv.innerHTML =
      '<div class="pv-backdrop" data-close></div>' +
      '<div class="pv-panel" role="dialog" aria-modal="true" aria-labelledby="pv-title">' +
        '<button class="pv-close" type="button" data-close aria-label="Close preview">×</button>' +
        '<div class="pv-top"><div class="pv-info">' +
          '<div class="showcase-kicker"><span class="showcase-mark" aria-hidden="true">SF</span><span>Social Films</span></div>' +
          '<h2 id="pv-title" class="pv-title"></h2>' +
          '<div class="showcase-meta"><span class="showcase-tag pv-tag"></span><span class="pv-where"></span></div>' +
          '<p class="pv-desc"></p>' +
          '<a class="btn btn-light pv-book" href="https://calendly.com/socialfilms-ca/30min" target="_blank" rel="noopener">Book a call</a>' +
        '</div><div class="pv-video"></div></div>' +
        '<div class="pv-more"><h3 class="pv-more-title">More like this</h3><div class="pv-more-row"></div></div>' +
      '</div>';
    document.body.appendChild(pv);
    var pvVideo = pv.querySelector('.pv-video');
    var pvMore = pv.querySelector('.pv-more-row');
    var lastFocus = null;
    var closePreview = function () {
      pvVideo.innerHTML = '';
      pv.hidden = true;
      document.documentElement.classList.remove('pv-open');
      if (location.hash && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      if (lastFocus) lastFocus.focus();
    };
    var openPreview = function (film) {
      if (!film) return;
      if (pv.hidden) lastFocus = document.activeElement;
      pv.querySelector('.pv-title').textContent = film.title;
      pv.querySelector('.pv-tag').textContent = film.tag;
      pv.querySelector('.pv-where').textContent = film.meta;
      pv.querySelector('.pv-desc').textContent = film.desc;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + film.id + '?autoplay=1&rel=0&playsinline=1&iv_load_policy=3&color=white';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      f.title = film.title;
      pvVideo.innerHTML = '';
      pvVideo.appendChild(f);
      // "More like this": every other film, each opening its own preview
      pvMore.innerHTML = '';
      FILMS.forEach(function (other) {
        if (other === film) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pv-card';
        b.innerHTML = '<img alt="" loading="lazy"><span class="tile-shade" aria-hidden="true"></span><span class="tile-copy"><span class="tile-tag"></span><span class="tile-title"></span></span>';
        b.querySelector('img').src = other.img;
        b.querySelector('.tile-tag').textContent = other.tag;
        b.querySelector('.tile-title').textContent = other.title;
        b.setAttribute('aria-label', 'Preview ' + other.title);
        b.addEventListener('click', function () { openPreview(other); });
        pvMore.appendChild(b);
      });
      pv.hidden = false;
      document.documentElement.classList.add('pv-open');
      pv.querySelector('.pv-panel').scrollTop = 0;
      pv.querySelector('.pv-close').focus();
    };
    triggers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();                       // stay on this page
        openPreview(filmById(el.getAttribute('data-film')));
      });
    });
    pv.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closePreview); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pv.hidden) closePreview(); });
    // A link with a film in the address (e.g. work.html#lx7WtMI8dM4) opens that film's preview
    var openFromAddress = function () { openPreview(filmById(location.hash.slice(1))); };
    openFromAddress();
    window.addEventListener('hashchange', openFromAddress);
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

  // ── Contact form: no backend yet, so hand the inquiry to the visitor's mail app ──
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    // contact.html?topic=initiative (or sponsor, brand…) preselects the topic
    var want = new URLSearchParams(location.search).get('topic');
    if (want && form.elements.topic) {
      var opt = form.elements.topic.querySelector('option[value="' + want + '"]');
      if (opt) opt.selected = true;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ''; };
      var label = function (n) { var f = form.elements[n]; return f && f.selectedIndex > 0 ? f.options[f.selectedIndex].text : ''; };
      var lines = [
        v('message'), '',
        '— ' + v('name') + (v('role') ? ', ' + v('role') : ''),
        v('org') + (v('website') ? ' (' + v('website') + ')' : ''),
        v('email'), '',
        'Regarding: ' + (label('topic') || '—'),
        'Timeline: ' + (label('timeline') || 'Not sure yet'),
        'Budget: ' + (label('budget') || 'Not sure yet')
      ];
      var href = 'mailto:info@socialfilms.ca?subject=' + encodeURIComponent('Project inquiry from ' + v('name') + (v('org') ? ' (' + v('org') + ')' : '')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      var note = form.querySelector('.form-note');
      if (note) {
        note.innerHTML = 'Your email app should open with the inquiry ready to send. Nothing opened? Write to <a href="mailto:info@socialfilms.ca">info@socialfilms.ca</a>.';
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
