<#
  build.ps1 - generator static pentru site-ul GTS Company
  ------------------------------------------------------
  Citeste  src/layout.html, src/partials/*.html, src/pages/**/*.html
           si genereaza paginile pe limbi din src/templates/limba.html + src/data/limbi.json
  Scrie    paginile finale in radacina, ca foldere cu index.html
           (ex: url: /traduceri-autorizate/  ->  traduceri-autorizate/index.html)

  Rulare:  powershell -ExecutionPolicy Bypass -File build.ps1
  Preview: node server.js   ->  http://localhost:4321
#>

param(
  # Prefix pentru gazduire pe subcale (ex: GitHub Pages proiect).
  #   productie / Cloudflare Pages / preview local:  -BasePath ''      (implicit)
  #   GitHub Pages proiect:                          -BasePath '/gts-redesign-preview'
  [string]$BasePath = '',

  # Modul de verificare: evidentiaza afirmatiile marcate cu <span class="tbc">
  # si adauga banda galbena explicativa. Oprit implicit din 7 oct 2026, la cererea
  # clientei (verificarea textelor s-a incheiat); se reporneste cu -Review:$true.
  [bool]$Review = $false
)

$ErrorActionPreference = 'Stop'
$BasePath = $BasePath.TrimEnd('/')
$Root     = Split-Path -Parent $MyInvocation.MyCommand.Path
$SrcDir   = Join-Path $Root 'src'
$PagesDir = Join-Path $SrcDir 'pages'
$PartDir  = Join-Path $SrcDir 'partials'
$Layout   = Get-Content (Join-Path $SrcDir 'layout.html') -Raw -Encoding UTF8
$Utf8     = New-Object System.Text.UTF8Encoding($false)
$RXS      = [System.Text.RegularExpressions.RegexOptions]::Singleline

# ---- partiale ----
$Partials = @{}
if (Test-Path $PartDir) {
  Get-ChildItem $PartDir -Filter *.html | ForEach-Object {
    $Partials[$_.BaseName] = Get-Content $_.FullName -Raw -Encoding UTF8
  }
}
function Expand-Partials([string]$text) {
  for ($i = 0; $i -lt 4; $i++) {
    if ($text -notmatch '\{\{>\s*[\w-]+\s*\}\}') { break }
    $text = [regex]::Replace($text, '\{\{>\s*([\w-]+)\s*\}\}', {
      param($m)
      $k = $m.Groups[1].Value
      if ($Partials.ContainsKey($k)) { return $Partials[$k] }
      Write-Warning "  partial lipsa: $k"
      return ''
    })
  }
  return $text
}

$script:Urls  = @()
$script:Built = 0

# ---- articolele de blog, preluate de pe blog.gtstraduceri.ro ----
# Se incarca inainte de paginile scrise de mana, pentru ca pagina /blog/
# foloseste partiala generata {{> lista-articole}}.
$ArtPath = Join-Path $SrcDir 'data\articole.json'
$Articole = @()
if (Test-Path $ArtPath) {
  # Fara @() in jur: ConvertFrom-Json trimite tabloul ca un singur obiect, iar
  # @(...) l-ar impacheta ca element unic si bucla ar rula o singura data.
  $Articole = Get-Content $ArtPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $carduri = foreach ($a in $Articole) {
    $eticheta = if ($a.limba -eq 'en') { '<span class="art-lang">EN</span>' } else { '' }
    @"
      <a class="card art-card" href="/blog/$($a.slug)/">
        <h3>$($a.titlu)$eticheta</h3>
        <p>$($a.rezumat)</p>
      </a>
"@
  }
  $Partials['lista-articole'] = "<div class=`"grid-3 reveal`">`n" + ($carduri -join "`n") + "`n    </div>"
  $Partials['numar-articole'] = [string]$Articole.Count
}

function Render-Page([string]$raw, [string]$sourceName) {
  # front matter intre --- si ---
  $fm = [regex]::Match($raw, '^\s*---\s*\r?\n(.*?)\r?\n---\s*\r?\n(.*)$', $RXS)
  if (-not $fm.Success) { Write-Warning "  fara front matter: $sourceName (sarit)"; return }

  $meta = @{}
  foreach ($line in ($fm.Groups[1].Value -split "\r?\n")) {
    if ($line.Trim() -eq '') { continue }
    $kv = $line -split ':', 2
    if ($kv.Count -eq 2) { $meta[$kv[0].Trim()] = $kv[1].Trim() }
  }
  $body = $fm.Groups[2].Value

  # bloc <!--head--> ... <!--/head-->  ->  {{HEAD}}
  $head = ''
  $hm = [regex]::Match($body, '<!--head-->(.*?)<!--/head-->', $RXS)
  if ($hm.Success) { $head = $hm.Groups[1].Value.Trim(); $body = $body.Remove($hm.Index, $hm.Length) }

  $url = $meta['url']
  if ([string]::IsNullOrWhiteSpace($url)) { Write-Warning "  fara 'url': $sourceName (sarit)"; return }

  $html = $Layout
  $html = $html.Replace('{{CONTENT}}', $body.Trim())
  $html = $html.Replace('{{HEAD}}',    $head)
  $html = $html.Replace('{{TITLE}}',   $meta['title'])
  $html = $html.Replace('{{DESC}}',    $meta['desc'])
  $html = $html.Replace('{{URL}}',     $url)

  if ($Review) {
    $html = $html.Replace('{{REVIEWCLASS}}', ' class="review-mode"')
    $html = $html.Replace('{{REVIEWBAR}}',
      '<div class="review-bar">Versiune de verificare. Textele marcate cu galben si eticheta <b>de confirmat</b> sunt propuneri redactate de noi, care asteapta confirmarea dumneavoastra inainte de publicare.</div>')
  } else {
    $html = $html.Replace('{{REVIEWCLASS}}', '')
    $html = $html.Replace('{{REVIEWBAR}}', '')
  }

  $html = Expand-Partials $html

  $nav = $meta['nav']
  if (-not [string]::IsNullOrWhiteSpace($nav)) {
    $html = $html -replace ('data-k="' + [regex]::Escape($nav) + '"'), ('data-k="' + $nav + '" class="active"')
  }

  # Prefixeaza legaturile interne absolute, pentru gazduire pe subcale.
  # Nu atinge http(s):// , // , mailto: , tel: sau ancore.
  if ($BasePath -ne '') {
    $html = $html -replace '(href|src)="/(?!/)', ('$1="' + $BasePath + '/')
  }

  if ($url -eq '/') { $outFile = Join-Path $Root 'index.html' }
  else {
    $outDir = Join-Path $Root ($url.Trim('/') -replace '/', '\')
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    $outFile = Join-Path $outDir 'index.html'
  }

  [System.IO.File]::WriteAllText($outFile, $html, $Utf8)
  $script:Built++
  $script:Urls += $url
  Write-Host ("  {0,-44} -> {1}" -f $url, ($outFile.Replace($Root, '.')))
}

# ---- 1. paginile scrise de mana ----
Write-Host "Pagini:" -ForegroundColor Cyan
Get-ChildItem $PagesDir -Filter *.html -Recurse | Sort-Object FullName | ForEach-Object {
  Render-Page (Get-Content $_.FullName -Raw -Encoding UTF8) $_.Name
}

# ---- 2. paginile pe limbi, din sablon ----
$tplPath  = Join-Path $SrcDir 'templates\limba.html'
$dataPath = Join-Path $SrcDir 'data\limbi.json'
if ((Test-Path $tplPath) -and (Test-Path $dataPath)) {
  Write-Host "`nLimbi (din sablon):" -ForegroundColor Cyan
  $tpl   = Get-Content $tplPath -Raw -Encoding UTF8
  $limbi = Get-Content $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($l in $limbi) {
    $docs = ($l.docs | ForEach-Object { "        <li>$_</li>" }) -join "`n"
    $page = $tpl.Replace('{{SLUG}}', $l.slug).
                 Replace('{{LIMBA_JOS}}', $l.limbaJos).
                 Replace('{{LIMBA}}', $l.limba).
                 Replace('{{DIN_LIMBA}}', $l.dinLimba).
                 Replace('{{SPECIFIC}}', $l.specific).
                 Replace('{{DOCS}}', $docs)
    Render-Page $page ("limba-" + $l.slug)
  }
}

# ---- 3. articolele de blog, din sablon ----
$artTpl = Join-Path $SrcDir 'templates\articol.html'
if ((Test-Path $artTpl) -and $Articole.Count -gt 0) {
  Write-Host "`nArticole de blog (din sablon):" -ForegroundColor Cyan
  $tplA = Get-Content $artTpl -Raw -Encoding UTF8
  foreach ($a in $Articole) {
    $langAttr = if ($a.limba -eq 'en') { ' lang="en"' } else { '' }
    $page = $tplA.Replace('{{SLUG}}', $a.slug).
                  Replace('{{TITLU}}', $a.titlu).
                  Replace('{{REZUMAT}}', $a.rezumat).
                  Replace('{{LANGATTR}}', $langAttr).
                  Replace('{{CORP}}', $a.corp)
    Render-Page $page ("articol-" + $a.slug)
  }
}

# ---- 4. sitemap ----
$sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n"
foreach ($u in ($script:Urls | Sort-Object -Unique)) { $sm += "  <url><loc>https://www.gtstraduceri.ro$u</loc></url>`n" }
$sm += '</urlset>'
[System.IO.File]::WriteAllText((Join-Path $Root 'sitemap.xml'), $sm, $Utf8)

Write-Host ""
Write-Host "Gata. $($script:Built) pagini generate, sitemap.xml actualizat." -ForegroundColor Green
Write-Host "Preview: node server.js  ->  http://localhost:4321"
