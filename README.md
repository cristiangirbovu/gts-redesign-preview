# GTS Company - versiunea nouă de site (PREVIEW)

Construcție pe baza planului din studiul SEO livrat pe 4 august 2026.
**Nimic din acest folder nu este publicat.** Este strict mediu de preview.

---

## ⚠️ Înainte de punerea în producție

Trei lucruri **trebuie** schimbate, altfel site-ul nu va fi indexat sau va pierde pozițiile actuale:

1. **Scoate `noindex` din `src/layout.html`.**
   Linia `<meta name="robots" content="noindex,nofollow">` blochează intenționat
   indexarea pe preview. La lansare se șterge, apoi se rulează build din nou.

2. **Activează redirecționările.**
   Redenumește `.htaccess.pregatit` în `.htaccess` pe serverul live.
   Verifică întâi lista reală de URL-uri indexate din Google Search Console.

3. **Confirmă datele de contact.**
   Adresa din Buzău (parter sau etajul 2, apartament 215) și telefonul principal
   de la Pipera (0745 161 406 sau 0742 067 006). Apar în mai multe locuri și
   trebuie să fie identice peste tot, inclusiv în profilurile Google Business.

---

## Cum rulezi

```bash
powershell -ExecutionPolicy Bypass -File build.ps1
node server.js
```

Preview la **http://localhost:4321**

Verificare legături interne (cu serverul pornit):

```bash
node check-links.js
```

---

## Structura proiectului

```
src/
  layout.html          antetul, meniul, subsolul, bara mobilă. Se aplică pe toate paginile.
  partials/            bucăți refolosite: formularele, banda de încredere, birourile, banda CTA
  pages/               conținutul fiecărei pagini, cu front matter (url, title, desc, nav)
  templates/limba.html șablonul paginilor pe limbi
  data/limbi.json      datele pentru fiecare limbă
assets/
  css/style.css        tot stilul, într-un singur fișier
  js/main.js           meniu mobil, formular, animații la scroll
  hero.jpg
build.ps1              generatorul. Scrie paginile finale în rădăcină.
server.js              server local de preview, fără dependințe
check-links.js         verificator de legături interne
```

Paginile generate (`index.html`, `traduceri-autorizate/`, etc.) sunt **rezultatul
build-ului**. Nu le edita direct, se suprascriu la următoarea rulare.
Editează în `src/`.

## Cum adaugi o pagină nouă

Creezi un fișier în `src/pages/` cu front matter:

```html
---
url: /adresa-noua/
title: Titlul din Google
desc: Descrierea din rezultatele Google, sub 160 de caractere.
nav: servicii
---

<section class="phero"> ... </section>
```

`nav` marchează secțiunea activă în meniu: `servicii`, `documente`, `limbi`,
`zone`, `preturi`, `blog`, `contact`. Lasă gol dacă pagina nu e în meniu.

## Cum adaugi o limbă nouă

Adaugi o intrare în `src/data/limbi.json` și rulezi build. Pagina se generează
singură din șablon.

---

## Ce s-a construit (30 de pagini)

**Servicii:** traduceri autorizate, traduceri legalizate, apostila de la Haga,
traduceri tehnice, interpretariat, transcriere audio-video, subtitrare video

**Documente:** acte auto, acte de stare civilă, diplome și foi matricole, acte de firmă

**Limbi:** hub + engleză, germană, italiană, spaniolă (restul se adaugă din JSON)

**Zone:** București, Sector 1, Sector 2, Buzău, Otopeni

**Companie:** prețuri, despre noi, acreditare ISO, întrebări frecvente, blog,
contact, confidențialitate, termeni

## Ce a rămas de făcut

- Migrarea celor 30 de articole de blog de pe `blog.gtstraduceri.ro`, cu adrese noi
- Textele legale (`/confidentialitate/`, `/termeni/`) au câmpuri de completat
- Versiunea în engleză a site-ului, dacă se păstrează
- Fotografii reale ale birourilor și echipei, pentru paginile de zonă și Google Business
- Pagina 404
