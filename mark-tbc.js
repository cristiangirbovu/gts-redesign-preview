/* Marcheaza afirmatiile neconfirmate din src/ cu <span class="tbc">...</span>.
   Ruleaza o singura data: sare peste ce e deja marcat.
   node mark-tbc.js            -> aplica
   node mark-tbc.js --dry      -> arata doar ce ar face  */
const fs = require('fs');
const DRY = process.argv.includes('--dry');

// wrap: incadreaza textul vizibil.  set: inlocuieste textul (pentru title/desc din front matter)
const JOBS = {
  'src/pages/index.html': {
    wrap: [
      'Peste 30 de limbi',
      'Legalizare notarială inclusă',
      'Urgențe în aceeași zi',
      'primești oferta în maxim 2 ore',
    ],
    set: [
      ['Ofertă în maxim 2 ore. Birouri proprii în Buzău și în Pipera, ISO 9001:2015, din 2004.',
       'Birouri proprii în Buzău și în Pipera, certificare ISO 9001:2015, din 2004.'],
      // Google cere ca aggregateRating sa fie real si verificabil. Il scoatem pana la confirmare.
      [',\n      "hasCredential": "ISO 9001:2015",\n      "aggregateRating": {\n        "@type": "AggregateRating",\n        "ratingValue": "5.0",\n        "reviewCount": "50",\n        "bestRating": "5"\n      }',
       ',\n      "hasCredential": "ISO 9001:2015"'],
    ],
  },
  'src/layout.html': {
    set: [
      ['<a href="/traducator-autorizat/">Toate cele 30 de limbi</a>', '<a href="/traducator-autorizat/">Toate limbile</a>'],
    ],
  },
  'src/partials/offices.html': {
    wrap: [
      'Luni - Vineri, 08:00 - 16:30',
      'Luni - Vineri, 08:30 - 16:30',
    ],
  },
  'src/pages/despre-noi.html': {
    wrap: [
      'pentru peste 30 de limbi',
      'Fiecare traducere trece printr-o verificare separată înainte de ștampilare.',
      'Nu te lăsăm să aștepți o zi ca să afli un preț. În timpul programului, oferta pleacă în maximum două ore.',
      'Înseamnă că avem proceduri scrise pentru primirea comenzii, pentru alocarea traducătorului, pentru verificare și pentru livrare, și că suntem auditați periodic pe respectarea lor.',
      'Regula noastră este simplă: dacă o instituție respinge documentul din cauza traducerii, îl corectăm prioritar și fără costuri suplimentare. Iar dacă termenul nu mai poate fi respectat, îți spunem imediat, nu în ziua livrării.',
      'Nu suntem un intermediar care redirecționează lucrările, ci un birou cu sedii, program și oameni pe care îi poți întâlni.',
    ],
    set: [
      ['Certificare ISO 9001:2015 și peste 50 de recenzii de 5 stele.', 'Certificare ISO 9001:2015.'],
      ['Două birouri proprii, o certificare ISO și un rating de 5.0 obținut recenzie cu recenzie.',
       'Două birouri proprii și o certificare ISO 9001:2015.'],
    ],
  },
  'src/pages/acreditare-iso.html': {
    wrap: [
      'Fiecare lucrare are un traseu documentat: ce s-a primit, când, cu ce termen și pentru ce destinație. Nimic nu depinde de memoria cuiva.',
      'Nu după cine e liber. Pentru documente tehnice sau juridice, alegerea se face în funcție de domeniu, nu doar de limbă.',
      'Traducerea trece printr-o verificare separată înainte de a fi ștampilată. Cine traduce nu se verifică singur.',
      'Dacă apare o observație din partea clientului sau a unei instituții, ea se înregistrează, se corectează și se analizează cauza, ca să nu se repete.',
    ],
  },
  'src/pages/traduceri-autorizate.html': {
    wrap: [
      'Peste 30 de limbi, cu traducători autorizați pentru fiecare.',
      'Traducătorul autorizat efectuează lucrarea, iar aceasta trece printr-o verificare separată înainte de ștampilare. Este procedura pentru care avem certificarea ISO 9001:2015.',
      'Lucrăm din 2004 și avem procedură scrisă pentru fiecare tip de document, tocmai pentru că știm ce verifică fiecare instituție. Dacă totuși apare o observație din partea autorității, o corectăm fără costuri suplimentare.',
      'Îți comunicăm prețul exact și termenul de livrare. Fără costuri ascunse și fără surprize la ridicare.',
      'Pentru documente standard de una sau două pagini, în general între 24 și 48 de ore. Pentru urgențe putem livra în aceeași zi, în funcție de limbă și de volum.',
      'Personal de la birou, prin curier oriunde în țară, sau în format electronic dacă instituția acceptă varianta scanată.',
    ],
  },
  'src/pages/traduceri-legalizate.html': {
    wrap: [
      'Traducem, ducem la notariat și îți predăm documentul legalizat, gata de depus. Colaborăm cu notari publici din Buzău și din București.',
      'Efectuată de traducătorul autorizat pentru limba respectivă, cu verificare separată înainte de ștampilare.',
      'Mergem noi la notar. Lucrăm cu notariate din Buzău și din zona Pipera, cu care avem colaborare de ani de zile, ceea ce scurtează termenele.',
      'Nu. Ne ocupăm noi de tot procesul, de la traducere până la legalizare. Tu ne dai documentul original și îl primești înapoi împreună cu traducerea legalizată.',
      'În mod normal între 24 și 72 de ore, în funcție de limbă și de programul notariatului. Pentru urgențe se poate rezolva în aceeași zi, dacă originalul ajunge la noi dimineața.',
    ],
  },
  'src/pages/apostila-de-la-haga.html': {
    wrap: [
      'Iar dacă nu vrei să te ocupi tu, facem noi tot drumul.',
      'Întrebarea pe care o primim cel mai des.',
      'Dacă ne spui țara și tipul dosarului, în cele mai multe cazuri îți putem indica noi varianta corectă.',
      'Ne ocupăm de drumurile la Prefectură, Camera Notarilor sau MAE. Tu nu stai la coadă.',
      'Nu. Pe baza unei împuterniciri simple ne ocupăm noi de depunere și de ridicare, la toate instituțiile implicate.',
      'Pentru actele obișnuite, între <strong>2 și 5 zile lucrătoare</strong>.',
    ],
  },
  'src/pages/traduceri-tehnice.html': {
    wrap: [
      'Traduse de oameni care înțeleg domeniul, cu glosar de proiect și verificare separată.',
      'De aceea lucrăm cu <strong>glosar de proiect</strong>, construit la început și validat împreună cu dumneavoastră, aplicat apoi pe tot volumul, indiferent câți traducători lucrează în paralel.',
      'Extragem termenii-cheie și îi propunem spre validare. Dacă aveți deja o terminologie internă, o preluăm ca atare.',
      'Traducerea este urmată de o verificare separată, făcută de altcineva decât traducătorul. Este cerința procedurii noastre ISO 9001:2015.',
      'Primiți documentul în același format, cu tabele, scheme, cuprins și numerotare păstrate. Pentru fișiere needitabile facem prelucrare DTP.',
      'Glosarul și memoria de traducere se păstrează între proiecte. Practic, cu cât lucrăm mai mult împreună, cu atât terminologia devine mai stabilă, termenele mai scurte și costurile mai previzibile.',
      'Semnăm acord de confidențialitate înainte de a primi materialele, dacă politica dumneavoastră o cere, iar accesul la fișiere este limitat la persoanele care lucrează efectiv pe proiect.',
      'Depinde de limbă și de densitatea tehnică, dar în mod normal între 10 și 15 zile lucrătoare, cu livrări parțiale pe capitole dacă aveți nevoie să începeți verificarea mai devreme.',
      'Da. Pentru fișiere needitabile sau cu machetare complexă adăugăm o etapă de prelucrare DTP, ca să primiți documentul gata de folosit, nu doar textul tradus.',
    ],
  },
  'src/pages/interpretariat.html': {
    wrap: [
      'Traducere în timp real, din cabină sau cu echipament portabil. Pentru conferințe, seminarii și evenimente cu public.',
      'Rezervi din timp, confirmăm disponibilitatea în două ore.',
    ],
  },
  'src/pages/traduceri-buzau.html': {
    wrap: [
      'Asta contează mai ales când vorbim de acte care trebuie legalizate: originalul trebuie să ajungă fizic la notar, iar noi lucrăm cu notariate din Buzău, la câteva minute de birou.',
      'Ce rezolvăm cel mai des pentru clienții din Buzău',
      'Acoperim tot județul Buzău, inclusiv Râmnicu Sărat, Nehoiu, Pogoanele și Pătârlagele.',
      'Traducem pentru buzoieni din 2004, cu peste 50 de recenzii de 5 stele pe Google.',
      'Ce spun clienții din Buzău',
    ],
    set: [
      ['Peste 30 de limbi, ofertă în 2 ore, ISO 9001:2015, din 2004.',
       'Traducători autorizați de Ministerul Justiției, certificare ISO 9001:2015, din 2004.'],
      [',\n  "aggregateRating": {"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"50","bestRating":"5"}', ''],
    ],
  },
  'src/pages/traduceri-bucuresti.html': {
    wrap: [
      'Suntem la câteva minute de Voluntari și pe drumul către Otopeni, ceea ce ne face convenabili pentru toată zona de nord a orașului și pentru Ilfov.',
      'Pentru firmele cu volum recurent păstrăm glosarul și terminologia între proiecte, lucrăm pe bază de comandă lunară și emitem factură centralizat.',
    ],
    set: [
      ['Peste 30 de limbi, ofertă în 2 ore, ISO 9001:2015.',
       'Traducători autorizați de Ministerul Justiției, certificare ISO 9001:2015.'],
      [',\n  "aggregateRating": {"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"50","bestRating":"5"}', ''],
    ],
  },
  'src/pages/traduceri-sector-2.html': {
    wrap: [
      'Pentru acte care se legalizează, originalul rămâne în oraș, la notariate cu care lucrăm de ani de zile.',
      'Suntem în inima zonei. Parcurile de birouri, rezidențialul din jur și firmele din vecinătate ne au la câteva minute distanță.',
      'La câteva minute de birou. Mulți dintre clienții noștri din Voluntari vin direct, fără programare.',
      'Zone bine conectate cu Pipera. Pentru volume mari organizăm preluarea documentelor.',
      'Ce se cere cel mai des în Sectorul 2',
    ],
  },
  'src/pages/traduceri-sector-1.html': {
    wrap: [
      'Biroul nostru din Pipera este la câteva minute, iar pentru actele cerute de ambasade știm exact ce formă trebuie să aibă dosarul.',
      'Din experiența acumulată în 22 de ani, în cele mai multe cazuri putem spune din start ce combinație îți trebuie, în funcție de ambasada la care depui și de tipul dosarului.',
      'Este cea mai frecventă cauză a dosarelor respinse și se rezolvă cu un singur telefon.',
      'La 10 minute de biroul nostru din Pipera. Zonă rezidențială și de birouri, cu multe dosare de rezidență și acte pentru școli internaționale.',
      'Instituții centrale și birouri corporate, pentru care lucrăm frecvent pe acte de firmă.',
      'Pentru volume mai mari sau pentru firme, organizăm preluarea documentelor direct de la sediul tău.',
    ],
  },
  'src/pages/traduceri-otopeni.html': {
    wrap: [
      'Lucrăm frecvent cu acte de călătorie, apostilă urgentă și documentație pentru firmele din zona aeroportuară.',
      'Ce rezolvăm cel mai des în zonă',
      'Prioritizăm lucrările cu termen fix și îți confirmăm din prima dacă ajungem la timp, inclusiv pentru pașii care depind de notariat sau de instituțiile care aplică apostila.',
    ],
  },
  'src/pages/traducator-autorizat.html': {
    wrap: [
      'Toți autorizați de Ministerul Justiției. Pentru limbile rare, spune-ne din timp: sunt puțini traducători în țară și se programează.',
      'Pentru oricare dintre limbile de mai jos putem asigura traducere autorizată, iar la cerere și legalizare notarială sau apostilă.',
    ],
    set: [
      ['Traducător Autorizat | Peste 30 de limbi | GTS Company', 'Traducător Autorizat | Traduceri oficiale | GTS Company'],
      ['Traducători autorizați de Ministerul Justiției pentru peste 30 de limbi. Traduceri oficiale, legalizate sau apostilate. Ofertă în 2 ore, din 2004.',
       'Traducători autorizați de Ministerul Justiției. Traduceri oficiale, legalizate sau apostilate, din 2004.'],
      ['<h1>Traducători autorizați pentru peste 30 de limbi</h1>',
       '<h1>Traducători autorizați de Ministerul Justiției</h1>'],
      ['<h2>Toate limbile în care lucrăm</h2>', '<h2><span class="tbc">Limbile în care lucrăm</span></h2>'],
      ['<p><b>Limba ta nu apare în listă?</b> Întreabă oricum. Rețeaua noastră de colaboratori acoperă și limbi pe care nu le afișăm aici, iar dacă nu putem prelua lucrarea îți spunem direct, ca să nu pierzi timp.</p>',
       '<p><b>Lista de mai sus este o propunere, nu o listă confirmată.</b> <span class="tbc">Am inclus limbile uzuale pentru un birou de traduceri din România. Vă rugăm să tăiați limbile pentru care nu aveți traducător autorizat și să adăugați ce lipsește. Publicăm doar lista confirmată de dumneavoastră.</span></p>'],
    ],
  },
  'src/pages/preturi.html': {
    wrap: [
      'Îți spunem numărul exact de pagini standard în ofertă, înainte să începem lucrarea. Fără recalculări la final.',
      'La proiecte mari se aplică reduceri, mai ales dacă textul are segmente repetitive.',
      'Nu adăugăm costuri care nu au fost anunțate în ofertă. Dacă pe parcurs apare ceva ce schimbă calculul, de exemplu documentul se dovedește mult mai lung decât părea din poză, te sunăm înainte, nu după.',
      'Calculăm numărul real de pagini standard, nu estimăm din ochi.',
      'Pentru lucrări obișnuite, plata se face la ridicarea documentelor. Pentru volume mari sau proiecte de firmă stabilim condițiile în comandă.',
      'Livrarea în regim de urgență, în aceeași zi, presupune un tarif majorat.',
      '<strong>2.000 de caractere cu spații</strong>',
    ],
  },
  'src/pages/intrebari-frecvente.html': {
    wrap: [
      'Pentru documente standard de una sau două pagini, între 24 și 48 de ore. Cu legalizare, între 24 și 72 de ore, în funcție de programul notariatului. Pentru urgențe putem livra în aceeași zi, dacă documentul ajunge la noi dimineața.',
      'Pentru lucrări obișnuite, plata se face la ridicarea documentelor. Pentru volume mari sau proiecte de firmă stabilim condițiile în comandă.',
      'Da, la ambele birouri, în timpul programului. Pentru interpretariat însă este nevoie de rezervare din timp.',
      'Dacă respingerea este cauzată de traducere, o corectăm prioritar și fără costuri suplimentare. Trimite-ne observația primită de la instituție și ne ocupăm.',
      'Accesul este limitat la persoanele care lucrează efectiv pe lucrare. Pentru firme semnăm acord de confidențialitate înainte de a primi materialele, dacă politica dumneavoastră o cere.',
      'Transcrierea numelor proprii este cea mai frecventă cauză de respingere a dosarelor. Verificăm concordanța cu actul de identitate și îți spunem cum tratăm diferența, ca instituția să nu aibă obiecții.',
      'La pagina standard de 2.000 de caractere cu spații din documentul tradus.',
    ],
  },
  'src/pages/termeni.html': {
    wrap: [
      'Oferta se comunică în maximum 2 ore în timpul programului de lucru și conține prețul, termenul și, unde este cazul, taxele notariale sau oficiale separate.',
      'Prețul se calculează la pagina standard de 2.000 de caractere cu spații din documentul tradus. Plata se face la ridicarea documentelor, dacă nu s-a convenit altfel.',
      'Dacă o instituție respinge documentul din motive imputabile traducerii, Prestatorul efectuează corectura cu prioritate și fără costuri suplimentare.',
    ],
  },
  'src/pages/traduceri/acte-auto.html': {
    wrap: [
      'Traducere autorizată, gata în 24 până la 48 de ore.',
      'Dacă ne spui de unde ai adus mașina și unde o înmatriculezi, îți spunem ce am văzut cel mai des cerut în situația respectivă.',
      'Avem traducători autorizați pentru toate aceste limbi, obișnuiți cu formularele auto specifice fiecărei țări, inclusiv cu abrevierile tehnice care apar pe talon.',
      'În 24 până la 48 de ore, sau în aceeași zi pentru urgențe.',
      'Da, pentru documente auto standard, dacă ajung la noi dimineața.',
      'De la biroul din Buzău sau din Pipera, ori direct la adresa ta.',
    ],
  },
  'src/pages/traduceri/certificat-de-nastere.html': {
    wrap: [
      'Verificăm întotdeauna concordanța cu actul de identitate, iar dacă există diferențe între documente, îți semnalăm situația înainte de a livra traducerea.',
      'Transcrierea numelor și a localităților este cea mai frecventă sursă de probleme la actele de stare civilă.',
      'Spune-ne în ce țară depui actul și la ce instituție, iar noi îți indicăm ordinea corectă și ne ocupăm de tot lanțul.',
    ],
  },
  'src/pages/traduceri/diplome-si-foi-matricole.html': {
    wrap: [
      'Lucrăm cu traducători obișnuiți cu dosare de echivalare și păstrăm consecvența între diplomă și foaia matricolă, care se depun împreună și sunt comparate.',
      'Traducerea propriu-zisă a unei diplome cu foaie matricolă durează în general 48 de ore. Dacă dosarul include și apostilă, socotește între una și două săptămâni pentru tot lanțul, în funcție de instituțiile implicate.',
    ],
  },
  'src/pages/traduceri/acte-firma.html': {
    wrap: [
      'Păstrăm terminologia și denumirile oficiale între proiecte, astfel încât aceleași noțiuni să apară identic în toate documentele. Lucrăm pe bază de comandă și emitem factură centralizat.',
      'Semnăm acord de confidențialitate înainte de a primi documentele, dacă politica firmei dumneavoastră o cere. Accesul la fișiere este limitat la persoanele care lucrează efectiv pe proiect.',
    ],
  },
  'src/pages/contact.html': {
    wrap: [
      'Luni - Vineri, 08:00 - 16:30. Sâmbătă și duminică: închis',
      'Luni - Vineri, 08:30 - 16:30. Sâmbătă și duminică: închis',
      'Suntem în centrul orașului, în clădirea Hotel Coroana, pe Bulevardul Nicolae Bălcescu. Reper: zona centrală, la câțiva pași de Piața Daciei. Parcare disponibilă în zonă.',
      'În clădirea de birouri SERICO, pe Șoseaua Pipera, Sector 2. Reper: zona Pipera, aproape de parcurile de birouri. La câteva minute de Voluntari și pe drumul către Otopeni. Parcare la clădire.',
      'Trimiți documentul scanat, iar traducerea o primești prin curier oriunde în țară sau electronic, dacă instituția acceptă varianta scanată.',
    ],
  },
  'src/partials/trust-strip.html': {
    wrap: [
      '<b>Ofertă în 2 ore</b><span>În timpul programului</span>',
      '<b>5.0 din 50+ recenzii</b><span>Verificate pe Google</span>',
    ],
  },
  'src/templates/limba.html': {
    wrap: [
      '{{SPECIFIC}}',
      'Pentru documente standard de una sau două pagini, între 24 și 48 de ore. Pentru urgențe, în aceeași zi, dacă documentul ajunge la noi dimineața. Pentru volume mari stabilim un calendar cu livrări parțiale, ca să poți începe verificarea mai devreme.',
      'Pentru notariat, stare civilă sau întâlniri de afaceri asigurăm și <a href="/interpretariat/">interpretariat autorizat</a> de {{LIMBA_JOS}}.',
    ],
    set: [
      ['<a href="/traducator-autorizat/">Toate cele 30 de limbi</a>', '<a href="/traducator-autorizat/">Toate limbile</a>'],
    ],
  },
};

let wrapped = 0, replaced = 0;
const missed = [];

for (const [file, job] of Object.entries(JOBS)) {
  if (!fs.existsSync(file)) { missed.push(file + '  ->  FISIER LIPSA'); continue; }
  let t = fs.readFileSync(file, 'utf8');

  for (const [from, to] of (job.set || [])) {
    if (!t.includes(from)) { missed.push(file + '  ->  [set] ' + from.slice(0, 70)); continue; }
    t = t.split(from).join(to); replaced++;
  }
  for (const s of (job.wrap || [])) {
    if (!t.includes(s)) { missed.push(file + '  ->  [wrap] ' + s.slice(0, 70)); continue; }
    if (t.includes('<span class="tbc">' + s)) continue; // deja marcat
    t = t.split(s).join('<span class="tbc">' + s + '</span>'); wrapped++;
  }
  // Marcajul nu are ce cauta in blocurile <script> (JSON-LD): ar strica JSON-ul.
  t = t.replace(/<script[^>]*>[\s\S]*?<\/script>/g,
    blk => blk.replace(/<span class="tbc">/g, '').replace(/<\/span>/g, ''));

  if (!DRY) fs.writeFileSync(file, t, 'utf8');
}

console.log((DRY ? '[SIMULARE] ' : '') + 'Marcate: ' + wrapped + '   Inlocuite: ' + replaced);
if (missed.length) {
  console.log('\nNU S-AU POTRIVIT (' + missed.length + '):');
  missed.forEach(m => console.log('  ' + m));
  process.exitCode = 1;
} else {
  console.log('Toate potrivite.');
}
