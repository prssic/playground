# SSIC — structură nouă, multi-pagină (fără eroarea Jekyll)

## Ce era stricat
Eroarea `Liquid Exception: stack level too deep in board.html` înseamnă strict
un include/layout care ajunge, direct sau prin lanț, să se includă pe el
însuși — Jekyll intră într-o buclă infinită la randare. Cu structura
`_layouts/default.html` + `_includes/views/*.html` din repo-ul vechi, undeva
în acel lanț (probabil în felul în care `default.html` alegea ce view din
`_includes/views/` să bage în pagină) exista o recursivitate.

În loc să vânez bug-ul exact în acel fișier (nu-l am, doar screenshot-uri),
am reconstruit site-ul din HTML-ul monolitic pe care mi l-ai dat, cu o
structură mult mai simplă și fără nicio recursivitate posibilă: fiecare
pagină de nivel superior are `layout: default` și atât — nimic nu se
autoincludere.

## Ce înlocuiește ce, în repo
Șterge din repo:
- tot folderul `_includes/views/` (nu mai e nevoie de el)
- `_layouts/default.html` vechi (înlocuiește-l cu cel de aici)

Păstrează neschimbate:
- `assets/` (pozele/video-urile tale — nu le-am atins)
- `CNAME` (conține `ssic.ro`)

Adaugă/înlocuiește cu fișierele din acest pachet:
- `_config.yml`
- `_layouts/default.html`
- `index.html`, `evenimente.html`, `board.html`, `facultate.html`,
  `studenti.html`, `gallery.html` (la rădăcina repo-ului)

## De ce funcționează acum independent, pe URL propriu
Fiecare pagină are `permalink:` în antet (ex. `permalink: /evenimente/`), deci
GitHub Pages/Jekyll o publică la exact acea adresă — `ssic.ro/evenimente/`,
`ssic.ro/board/` etc. — încărcată de server ca pagină reală, independentă,
nu simulată în JS.

Meniul de navigare, footer-ul, "Structură Board → Consiliu Director" etc.
folosesc acum `<a href="...">` reale către acele URL-uri (cu `#dept-cd` etc.
pentru tab-ul corect), nu `onclick` + JS care schimba doar un `div` ascuns
pe aceeași pagină, cum era înainte.

Toată logica de interfață care nu ține de rutare — carusele, tab-urile
Board/Facultate/Studenți/Evenimente, harta, căutarea, modalul de contact,
cursorul custom, footer-ul — a rămas identică, doar mutată în
`_layouts/default.html` (partajată de toate paginile).

## Un singur lucru de verificat manual
Căutarea (`⌘K`) poate acum trimite către o altă pagină (ex. cauți un membru
din Facultate, dar ești pe Acasă) — face `location.href` către pagina
corectă, cu tab-ul potrivit deschis automat la încărcare. Testează o
căutare cross-pagină după deploy, ca să confirmi că ajunge unde trebuie.
