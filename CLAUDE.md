# Claude Code — KUTISKO

## Misia
Rýchlo vytvoriť funkčný, esteticky kvalitný mobil-first prototyp KUTISKO pre rodičov hľadajúcich detské kútiky, vnútorné herne a vonkajšie ihriská. Pilot Bratislava a okolie.

## Zdroj pravdy
Pred prácou čítaj dostupné `PRODUCT_MANIFESTO.md`, `PROTOTYPE_BRIEF.md`, `DESIGN_SYSTEM_PROPOSAL.md`, `MVP_ROADMAP.md`, `DECISIONS.md`. Ak niektorý dokument chýba, oznám to a nevymýšľaj jeho obsah. Pri konflikte sa pýtaj.

## Agilný režim: build → test → improve
- Pracuj v malých vertikálnych rezoch: funkčný výsledok, kontrola, ďalšia iterácia.
- Samostatne rozhoduj o bežných UI detailoch a technickej implementácii v schválenom rozsahu; nepýtaj sa na každú maličkosť.
- Priebežne spúšťaj dostupné kontroly (lint, typecheck, build, funkčné overenie); neoznačuj netestované za overené.
- Po každej iterácii stručne uveď: hotové, overené, otvorené problémy, ďalší krok.
- Vyžiadaj schválenie pri zmene produktového smeru, výraznej zmene dizajnového konceptu, novej platenej službe, práci s reálnymi údajmi alebo zásahu do produkcie.
- Nečakaj na schválenie každej obrazovky: najprv vytvor presvedčivý Home koncept, ukáž ho na skorú spätnú väzbu a následne iteruj súvisiace obrazovky v rámci schváleného smeru.
- Backend, reálna autentifikácia a databáza sú mimo aktuálnej fázy bez výslovného schválenia.

## UX a vizuálna kvalita — povinné
- Aplikácia je pre rodičov, nie pre deti. Prémiový, vzdušný, elegantný a zrozumiteľný dizajn.
- Striedmo používaj energickú paletu B; kontrast a prístupnosť majú prednosť pred dekoráciou.
- Vytvor konzistentné komponenty, typografickú hierarchiu, rytmus medzier, responzívne stavy a použiteľné dotykové plochy.
- Dôraz na rýchle vyhľadávanie, filtre, kvalitné karty miest, mapu, detail a navigáciu.
- Vždy rieš loading/empty/error stavy a klávesnicovú prístupnosť, kde je relevantná.
- Simonkine originálne ilustrácie sú občasný prvok identity; dodá ich vlastník samostatne. Nepublikuj ich bez schválenia.
- Pôvodné mockupy sú len referencie; logo nie je finálne.
- Pred dokončením každej obrazovky vykonaj vizuálnu a funkčnú sebakontrolu.

## Technológia a dáta
Preferuj Next.js + TypeScript + Tailwind, pokiaľ dokumentácia neurčuje inak. Použi jasne označené syntetické fixtures, nie vymyslené skutočné recenzie či overené prevádzky. Nepridávaj zbytočné závislosti.

## GitHub = projektový denník
- Každú dokončenú logickú zmenu commitni s výstižnou správou; nepoužívaj force push.
- Udržiavaj `CHANGELOG.md`: dátum, čo sa zmenilo, čo bolo otestované, známe obmedzenia.
- Udržiavaj `DECISIONS.md`: významné rozhodnutia, dôvod, alternatívy a dopad. Nevymýšľaj rozhodnutia používateľa.
- Na konkrétne chyby a úlohy používaj GitHub Issues, keď to prístup umožňuje.
- Dokumentáciu aktualizuj spolu s príslušnou zmenou kódu, nie dodatočne.
- Repozitár je verejný: žiadne heslá, API kľúče, súkromné dáta, fotografie detí či originálne ilustrácie bez výslovného súhlasu.

## Prvý cieľ
Priprav kvalitný, spustiteľný mobilný Home koncept so syntetickými dátami a funkčným základným vyhľadávaním. Ukáž výsledok na spätnú väzbu; potom postupuj v krátkych iteráciách.
