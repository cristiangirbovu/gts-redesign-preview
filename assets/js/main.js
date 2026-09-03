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
  function revealAll() {
    els.forEach(function (el) { el.classList.add('in'); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
    // Plasa de siguranta: daca observerul nu s-a declansat deloc in 3 secunde,
    // afisam tot. Continutul nu are voie sa ramana ascuns din cauza unei animatii.
    setTimeout(function () {
      if (document.querySelectorAll('.reveal.in').length === 0) { revealAll(); }
    }, 3000);
  } else {
    revealAll();
  }

  // Hartile Google se incarca doar dupa clic. Pana atunci pagina nu trimite
  // nicio cerere catre Google, deci nu se pun cookies si nu e nevoie de banner.
  document.querySelectorAll('.harta-cerere').forEach(function (cutie) {
    var buton = cutie.querySelector('.harta-incarca');
    if (!buton) return;
    buton.addEventListener('click', function () {
      var adresa = cutie.getAttribute('data-harta');
      if (!adresa) return;
      var cadru = document.createElement('iframe');
      cadru.className = 'map';
      cadru.setAttribute('loading', 'lazy');
      cadru.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      cadru.setAttribute('title', cutie.getAttribute('data-titlu') || 'Hartă');
      cadru.src = adresa;
      cutie.parentNode.replaceChild(cadru, cutie);
      // Mutam focalizarea pe harta, ca navigarea de la tastatura sa nu se piarda.
      cadru.setAttribute('tabindex', '-1');
      cadru.focus();
    });
  });

  // Butonul flotant de WhatsApp sta jos-dreapta, unde pe unele pagini ajunge
  // butonul de trimitere al formularului de ofertă. Cand cele doua dreptunghiuri
  // se suprapun, ridicam butonul flotant deasupra celui de trimitere.
  var waFloat = document.querySelector('.wa-float');
  if (waFloat) {
    var trimite = document.querySelector('.form-card button[type=submit], .form-card button, .form-card [type=submit]');
    if (trimite) {
      var inAsteptare = false;
      var MARJA = 12, JOS = 24, DREAPTA = 24; // aceleasi valori ca in CSS
      var potrivesteWa = function () {
        inAsteptare = false;
        // Calculam pozitia de baza din viewport, nu din dreptunghiul curent.
        // Altfel, cand butonul e deja ridicat, masuram pozitia corectata si
        // decizia oscileaza intre ridicat si coborat.
        var r = waFloat.getBoundingClientRect();
        var t = trimite.getBoundingClientRect();
        var bazaJos = window.innerHeight - JOS;
        var bazaSus = bazaJos - r.height;
        var bazaDreapta = window.innerWidth - DREAPTA;
        var bazaStanga = bazaDreapta - r.width;
        var seSuprapun = !(bazaDreapta < t.left - MARJA || bazaStanga > t.right + MARJA ||
                           bazaJos < t.top - MARJA || bazaSus > t.bottom + MARJA);
        if (seSuprapun) {
          waFloat.style.setProperty('--wa-salt', Math.ceil(bazaJos - t.top + MARJA) + 'px');
          waFloat.classList.add('ridicat');
        } else {
          waFloat.classList.remove('ridicat');
        }
      };
      // Temporizator, nu requestAnimationFrame: acesta din urma nu se executa
      // deloc cand pagina nu e vizibila, iar butonul ar ramane nepozitionat.
      var programeaza = function () {
        if (inAsteptare) return;
        inAsteptare = true;
        setTimeout(potrivesteWa, 0);
      };
      programeaza();
      window.addEventListener('scroll', programeaza, { passive: true });
      window.addEventListener('resize', programeaza);
      // Pozitiile se schimba dupa ce se incarca fonturile si imaginile, deci
      // remasuram si atunci, altfel verificarea de la inceput ramane invalida.
      window.addEventListener('load', function () {
        programeaza();
        // Sectiunile intra cu o animatie de translatie, deci pozitiile se mai
        // schimba dupa 'load'. Remasuram si dupa ce se aseaza.
        setTimeout(programeaza, 400);
        setTimeout(programeaza, 1200);
      });
      // Ignoram tranzitia proprie a butonului, altfel se declanseaza singur la nesfarsit.
      document.addEventListener('transitionend', function (ev) {
        if (ev.target === waFloat) return;
        programeaza();
      }, true);
      if (document.fonts && document.fonts.ready) { document.fonts.ready.then(programeaza); }
      if ('ResizeObserver' in window) { new ResizeObserver(programeaza).observe(document.body); }
    }
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
