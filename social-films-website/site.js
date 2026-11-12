/* Social Films — shared behaviour */
(function () {
  'use strict';

  // ── Click-to-play Vimeo facades ──────────────────────
  // No iframe loads until the user hits play, keeping pages light.
  document.querySelectorAll('.video').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.dataset.playing) return;
      el.dataset.playing = '1';
      var id = el.getAttribute('data-vimeo');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://player.vimeo.com/video/' + id +
        '?autoplay=1&title=0&byline=0&portrait=0&dnt=1';
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
