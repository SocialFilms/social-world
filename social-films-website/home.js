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
