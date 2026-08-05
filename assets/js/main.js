(function () {
  'use strict';

  // Mobile menu
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // File input labels
  document.querySelectorAll('.file input[type=file]').forEach(function (fi) {
    fi.addEventListener('change', function () {
      var b = fi.closest('.file').querySelector('b');
      if (!b) return;
      if (fi.files.length === 1) { b.textContent = fi.files[0].name; }
      else if (fi.files.length > 1) { b.textContent = fi.files.length + ' fișiere alese'; }
    });
  });

  // Reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // "Cere ofertă" din header duce la formular, oriunde s-ar afla
  document.querySelectorAll('a[href="#oferta"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var target = document.getElementById('oferta');
      if (!target) return; // fara formular in pagina, lasam ancora sa se comporte normal
      ev.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var first = target.querySelector('input, select, textarea');
      if (first) { setTimeout(function () { first.focus({ preventScroll: true }); }, 450); }
    });
  });
})();
