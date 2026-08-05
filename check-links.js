/* Verificator de legaturi interne. Ruleaza cu serverul pornit:
   node server.js   (in alt terminal)
   node check-links.js */
const BASE = 'http://localhost:4321';

(async () => {
  const seen = new Set();
  const queue = ['/'];
  const broken = [];
  const pages = [];

  while (queue.length) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);

    let res;
    try { res = await fetch(BASE + p); }
    catch (e) { broken.push([p, 'FETCH FAIL']); continue; }

    if (!res.ok) { broken.push([p, res.status]); continue; }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) { pages.push(p); continue; }

    const html = await res.text();
    pages.push(p);

    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      let u = m[1];
      if (u.startsWith('http') || u.startsWith('mailto:') || u.startsWith('tel:')) continue;
      if (u.startsWith('#')) continue;
      u = u.split('#')[0];
      if (!u) continue;
      if (!u.startsWith('/')) u = '/' + u;
      if (!seen.has(u)) queue.push(u);
    }
  }

  const htmlPages = pages.filter(p => !/\.(css|js|jpg|png|svg|xml|ico)$/.test(p));
  console.log('Pagini HTML atinse: ' + htmlPages.length);
  console.log('Resurse verificate:  ' + (pages.length - htmlPages.length));
  if (broken.length) {
    console.log('\nLEGATURI STRICATE (' + broken.length + '):');
    broken.forEach(b => console.log('  ' + b[1] + '  ' + b[0]));
    process.exitCode = 1;
  } else {
    console.log('\nOK: nicio legatura stricata.');
  }
})();
