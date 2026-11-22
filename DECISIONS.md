# Product & technical decisions

## 2026-11-21 — Verejný repozitár pre prototyp
**Rozhodnutie:** GitHub repozitár ostáva verejný. Originálne ilustrácie dodá vlastník samostatne Claude Code a nezverejnia sa bez súhlasu.
**Dôvod:** Zjednodušenie prístupu pri prototypovaní; ochrana autorských podkladov.
**Dopad:** Dokumentácia a kód sú verejne dostupné. Žiadne tajomstvá ani osobné údaje.

## 2026-11-21 — Agilný UX-first vývoj
**Rozhodnutie:** Claude Code pracuje samostatne v krátkych iteráciách, priebežne testuje a zlepšuje. Kvalitné, vzdušné UI pre rodičov je podmienka, nie dodatočná úprava.
**Dôvod:** Rýchlejší postup bez mikroschvaľovania a bez straty kvality.
**Dopad:** Skorá spätná väzba na Home, potom ďalšie obrazovky; zásadné zmeny a backend vyžadujú schválenie.

## 2026-11-21 — Projektová evidencia
**Rozhodnutie:** Commity + CHANGELOG.md + DECISIONS.md; úlohy a chyby podľa potreby v GitHub Issues.
**Dôvod:** Dohľadateľnosť práce, rozhodnutí a testov.

## 2026-11-22 — Pôvodné farby palety B nie sú textové tokeny
**Rozhodnutie (technické, v rámci schváleného smeru B):** Pôvodné HEX hodnoty z manifestu (`#FF526E`, `#F5AD1D`, `#5DC2D6`) sa v prototype používajú len ako brand/dekoratívne farby. Pre text a ovládacie prvky sa používajú tmavšie odtiene (`#D6264A`, `#B81E3E`, `#0E6B7D`, `#0B5866`, `#8A5A00`) navrhnuté v `DESIGN_SYSTEM_PROPOSAL.md`.
**Dôvod:** Pôvodné odtiene majú na bielej/krémovej kontrast 1.8–3.1 : 1, čo nespĺňa WCAG 2.1 AA (4.5 : 1 pre text). Manifest (bod 13, 20) vyžaduje overenie kontrastu.
**Alternatívy:** Ponechať pôvodné farby a používať na nich len tmavý text (obmedzuje tlačidlá a odkazy); zmeniť paletu (mimo schváleného smeru).
**Dopad:** Farebný charakter B ostáva, finálne hodnoty schvaľuje vlastník po vizuálnom teste konceptu Domov. Stav: návrh.

## 2026-11-22 — Otvorené body v dokumentoch označené ako [NÁVRH]
**Rozhodnutie (procesné):** V `PROTOTYPE_BRIEF.md`, `DESIGN_SYSTEM_PROPOSAL.md` a `MVP_ROADMAP.md` sú typografia, farebné tokeny, mapový provider, vekové filtre, KUTISKO skóre a ďalšie otvorené body z manifestu výslovne označené ako návrhy; schválené body odkazujú na číslo rozhodnutia v manifeste.
**Dôvod:** `CLAUDE.md` zakazuje vymýšľať rozhodnutia používateľa.
**Dopad:** Vlastník produktu rozhoduje o návrhoch; po schválení sa zapíšu sem ako samostatné rozhodnutia.

## 2026-11-22 — Typografia: Plus Jakarta Sans
**Rozhodnutie:** Vlastník produktu zveril výber písma realizátorovi („vyber to najlepšie pre takýto typ aplikácie“). Zvolené Plus Jakarta Sans pre nadpisy aj text.
**Dôvod:** Priateľský, ale dospelý a dôveryhodný charakter pre rodičov; čitateľnosť na mobile; plná slovenská diakritika; variabilný font, jedna rodina; OFL licencia.
**Alternatívy:** Fraunces + Inter (dve rodiny, serif menej vhodný do hustého UI), Nunito + Inter (príliš detský dojem).
**Dopad:** Uzatvára otvorenú otázku typografie z manifestu; použije sa v koncepte Domov. Ak by vizuálny test ukázal problém, zmena je lacná (jeden token).

## 2026-11-22 — Logo zatiaľ bez zmeny
**Rozhodnutie:** Vlastník: logo zatiaľ ponechať. Prototyp používa dočasný textový wordmark KUTISKO (manifest bod 23).
**Dopad:** Návrh loga ostáva samostatnou neskoršou úlohou.

## 2026-11-22 — Ilustrácia dievčatka v repozitári
**Rozhodnutie:** Vlastník výslovne povolil nahrať ilustráciu dievčatka do verejného repozitára. Uložené ako `assets/illustrations/dievcatko-kocky.png` a `dievcatko-lopta.png` (zo súborov `dieta01.png`, `dieta02.png`; obe zobrazujú tú istú postavu), s odstránenými metadátami.
**Dôvod:** Použitie v prázdnych stavoch a uvítaní prototypu (manifest bod 21).
**Dopad:** Súhlas sa týka len tejto ilustrácie; ďalšie autorské podklady stále vyžadujú samostatný súhlas.
