# Changelog

## 2026-11-22 — Príprava testu na iPhone (Fáza 3)
**Zmenené**
- Ručný výber mesta (scenár S5): na Domove je lokalita „Bratislava a okolie ▾“ tlačidlom, ktoré otvorí výber mesta (Bratislava, Senec, Stupava, Šamorín, Pezinok, Malacky). Vzdialenosti na kartách a v detaile aj zoradenie „Najbližšie“ sa počítajú od vybraného mesta; výber sa zdieľa s Profilom. Polohu prototyp nezisťuje.
- PWA: manifest, dočasná ikona „k“ (logo nie je finálne), `apple-touch-icon` a režim na celú obrazovku po „Pridať na plochu“ v Safari.
- `docs/TEST_IPHONE.md`: scenár testu s rodičmi (S1–S8), záverečné otázky, záznamový hárok, zásady súkromia.

**Otestované**
- `npm test` (18 testov vrátane výberu mesta a zoradenia od neho), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13, bez povolenej polohy): S1 vnútorná herňa pre 3–5 r. (3 výsledky), S2 navigačné odkazy Apple/Google/Waze, S3 uloženie a odstránenie so spätnou väzbou, S5 výber Senca → „19,0 km od Senca“, S6 prázdny stav s cestou späť, S7 texty „neuvedené“; manifest a apple-touch-icon sa servírujú. Bez chýb v konzole.

**Známe obmedzenia**
- Safari/WebKit ani fyzický iPhone zatiaľ netestované; verejný odkaz na test čaká na rozhodnutie o nasadení.
- Maximálna vzdialenosť z Profilu zatiaľ výsledky nefiltruje.

## 2026-11-22 — Uvítanie aj po prihlásení (rozhodnutie Martina)
**Zmenené**
- Po prihlásení sa ukáže krátke uvítanie „Ahoj, [meno]!“ s textom „Vitajte späť…“; po registrácii zostáva text „Účet je pripravený…“. Pri bežnom otvorení aplikácie sa uvítanie neukazuje.
- Registrácia v prototype ostáva nepovinná (zapísané v DECISIONS).

**Otestované**
- `npm test`, `typecheck`, `lint`, `build` prešli. Playwright (iPhone 13): registrácia → `/vitaj?novy=1`, prihlásenie → `/vitaj` s „Vitajte späť“, Domov bez uvítania.

## 2026-11-22 — Spodné menu neprekáža, simulovaná registrácia, prihlásenie a uvítanie
**Zmenené**
- Spodné menu sa pri posúvaní nadol schová a vráti sa pri posune nahor, pri vrchu a na konci stránky (aj pri fokuse klávesnicou). Na mape ostáva viditeľné. Pri „obmedziť pohyb“ bez animácie.
- `/registracia`: meno (oslovenie), e-mail, heslo (aspoň 8 znakov, zobraziť/skryť), potvrdenie, že ide o DEMO účet. Konkrétne chybové hlášky a fokus na prvé chybné pole.
- `/prihlasenie`: e-mail a heslo; neznámy e-mail ukáže vysvetlenie a odkaz na registráciu. Heslo sa neukladá ani neoveruje.
- `/vitaj`: krátke uvítanie „Ahoj, [meno]!“ so Simonkinou ilustráciou, nepovinný výber veku dieťaťa a „Začať hľadať“ (s vekom otvorí vyhľadávanie s filtrom). „Preskočiť“ vedie na Domov.
- Domov: oslovenie „Ahoj, [meno]!“ a iniciály v hlavičke; bez účtu tlačidlo „Prihlásiť sa“.
- Profil: karta účtu (meno, e-mail, DEMO) alebo výzva vytvoriť účet / prihlásiť sa; funkčné odhlásenie.

**Otestované**
- `npm test` (16 testov vrátane validácie registrácie a prihlásenia), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13): menu sa skryje po posune nadol, vráti sa po posune nahor aj na konci stránky; na mape zostáva; prázdna registrácia → 4 chyby a fokus na meno; registrácia → uvítanie „Ahoj, Jana!“ → výber veku → `/hladat?vek=3-5`; Domov s oslovením; odhlásenie v Profile; prihlásenie neznámeho e-mailu → hláška, známeho (iné veľké písmená) → Domov; bez vodorovného pretečenia, bez chýb v konzole.

**Známe obmedzenia**
- Účet existuje iba v tomto prehliadači; žiadna skutočná autentifikácia ani overenie hesla.
- Registrácia sa v prototype nevynucuje (v produkcii bude povinná).

## 2026-11-22 — Simulované hodnotenie, návrh miesta, nahlásenie a náhľad admin fronty
**Zmenené**
- Martin schválil náhľady obrazoviek z PR #2 (zapísané v DECISIONS).
- `/miesto/[id]/hodnotit`: celkový dojem 1–10 (povinný), voliteľné kritériá čistota a kreativita priestoru, text do 1000 znakov, voliteľná fotka. Jedno hodnotenie na miesto, dá sa upraviť; v detaile sa zobrazí „Vaše hodnotenie (DEMO)“.
- `/navrhnut`: návrh nového miesta (názov, typ, adresa/časť, vek, popis, fotka) s konkrétnymi chybovými hláškami a fokusom na prvé chybné pole.
- Fotky: náhľad sa zmenší a znovu zakóduje v prehliadači (odstráni EXIF/GPS), vyžaduje potvrdenie, že na fotke nie sú rozpoznateľné deti, a čaká na schválenie.
- Detail: „Nahlásiť nesprávny údaj“ (dôvod + poznámka).
- `/admin` (náhľad, DEMO, bez oprávnení): záložky Návrhy, Fotky, Nahlásenia, Recenzie; schváliť / zamietnuť / vrátiť, skryť recenziu bez zmeny hodnotenia, záznam zásahov, vymazanie DEMO zápisov. Obsahuje 2 ukážkové návrhy a 1 ukážkové nahlásenie.
- Profil: počet mojich hodnotení, odkazy na návrh miesta a admin frontu.

**Otestované**
- `npm test` (13 testov vrátane validácie formulárov), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13): odoslanie prázdneho hodnotenia → chybová hláška a fokus na stupnicu; fotka bez potvrdenia → chyba; úspešné odoslanie → potvrdenie a moje hodnotenie v detaile; nahlásenie bez dôvodu → chyba, s dôvodom → uložené; návrh s chybami (4 polia) → konkrétne hlášky, opravený návrh → potvrdenie; admin: 3 návrhy, schválenie návrhu a fotky, 2 nahlásenia, skrytie recenzie, záznam 3 zásahov; stav fotky sa prejaví v detaile; bez chýb v konzole.

**Známe obmedzenia**
- Všetko je iba v localStorage tohto prehliadača; žiadne skutočné zverejnenie ani oprávnenia.
- Ukážkové recenzie z dát sa v admin fronte nemoderujú, iba vlastné DEMO hodnotenia.
- Moje DEMO hodnotenie zatiaľ nemení zobrazené priemerné skóre miesta.

## 2026-11-22 — Rozšírené vyhľadávanie s mapou, Obľúbené a Profil (prototyp)
**Zmenené**
- `/hladat`: vyhľadávanie s rýchlymi filtrami (kategória, vnútri/vonku, zadarmo), panel Filtre (kategória, vek, prostredie, vybavenie, iba overené, iba zadarmo) s počtom výsledkov pred potvrdením, zoradenie, prepínač Zoznam / Mapa. Filtre sú v URL (dajú sa zdieľať, prežijú obnovenie).
- Interaktívna mapa na **MapLibre GL** s podkladmi OpenFreeMap (bez kľúča a poplatkov); piny sú synchronizované s filtrami, ťuk na pin ukáže náhľad miesta s odkazom na detail. Ak sa podklady nenačítajú, mapa zostane použiteľná na neutrálnom pozadí s upozornením.
- Tlačidlo „Celá mapa“ na Domove otvorí mapu s rovnakými filtrami.
- `/ulozene`: obľúbené miesta (localStorage), prázdny stav so Simonkinou ilustráciou a cestou „Objaviť miesta“.
- `/profil`: simulovaný účet, voliteľné preferencie (vek dieťaťa, ručný výber lokality, maximálna vzdialenosť) s možnosťou zmeniť alebo vymazať; vyhľadávanie ponúkne „Použiť vek z profilu“.
- Spodná navigácia je spoločná pre všetky obrazovky a zvýrazňuje aktuálnu stránku.
- Miesta majú údaj vnútri/vonku v základných dátach; nový skript kopíruje web worker MapLibre do `public/vendor/` (spúšťa sa pred `dev` a `build`).

**Otestované**
- `npm test` (11 testov vrátane nových filtrov), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13, desktop): Domov → Ihriská → Celá mapa (4 piny), ťuk na pin → náhľad, prepnutie na zoznam (4 karty), panel Filtre s vybavením „kaviareň“ (4 miesta), vyhľadávanie „ruzinov“ (1), uloženie a odstránenie v Obľúbených, uloženie a vymazanie preferencií v localStorage, bez horizontálneho scrollu na 390 px.

**Známe obmedzenia**
- V testovacom prostredí boli mapové podklady blokované sieťou, preto screenshoty ukazujú mapu bez podkladov (overený záložný stav). Vzhľad s podkladmi OpenFreeMap treba skontrolovať lokálne alebo na iPhone.
- Preferencia lokality a vzdialenosti sa zatiaľ len ukladá, výsledky ešte neovplyvňuje.
- Hodnotenie, návrh miesta a zmena hesla ukážu iba „pripravujeme“.

## 2026-11-22 — Vekové skupiny podľa schválenia
- Filter veku používa schválené skupiny 0–2, 3–5, 6–10, 10+ (predtým pracovné 0–3, 3–6, 6–10, 10+); hranice sa započítavajú vrátane.
- Otestované: `npm test` (rozšírený test hraničného veku), `typecheck`, `lint`, `build`.

## 2026-11-22 — Detail miesta a výber navigácie (prototyp)
**Zmenené**
- Martin schválil vizuálny smer obrazovky Domov v1 (pozri DECISIONS).
- Nová stránka `/miesto/[id]` (staticky generovaná pre 11 DEMO miest): ilustračný náhľad, kategória a vnútri/vonku, skóre 1–10 so slovným vyjadrením a počtom hodnotení, stav overenia, rýchle fakty (vek, cena, dnešné hodiny, prostredie), popis, vybavenie, čiastkové hodnotenie (čistota, kreativita priestoru, celkový dojem podľa `hodnotenie.png`), ukážkové recenzie, týždenné hodiny, poloha na ilustračnej mape, pôvod údajov, ďalšie miesta v okolí.
- Spodná lišta s cenou a tlačidlom **Navigovať** → výber Apple Mapy / Google Mapy / Waze (oficiálne univerzálne URL s webovým fallbackom, bez zisťovania polohy, s DEMO upozornením).
- Obľúbené sa ukladajú lokálne (localStorage) a sú spoločné pre Domov aj detail; Domov si pri návrate zo detailu zachová filtre (React Activity v Next.js 16).
- Stránka „Miesto nenájdené“, skeleton pri načítaní detailu.

**Otestované**
- `npm test` (10 testov vrátane URL navigácie), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13, desktop): Domov → filter Herne → karta → detail; uloženie srdiečkom sa prejaví v počítadle na Domove; dialóg navigácie má správne URL pre všetky tri služby a zatvorí sa klávesom Esc; Späť vráti na Domov so zachovaným filtrom; miesto bez hodnotení a neznámych údajov; neexistujúce miesto; bez chýb v konzole.

**Známe obmedzenia**
- Neexistujúce miesto zobrazí stránku „nenájdené“, ale HTTP kód je 200 (streamovanie s Cache Components).
- Hodnotenie, nahlásenie chyby a celá mapa zatiaľ zobrazia iba „pripravujeme“.
- Otvorenie aplikácií Apple Mapy/Waze netestované na fyzickom iPhone.

## 2026-11-22 — Koncept obrazovky Domov v1 (prototyp)
**Zmenené**
- Založený projekt Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, bez ďalších runtime závislostí.
- Obrazovka Domov: hlavička s dočasným wordmarkom, pozdrav „Kam ideme dnes?“, vyhľadávanie, filtre kategórií (Všetko / Kútiky / Herne / Ihriská) a veku (0–3, 3–6, 6–10, 10+), ilustračný náhľad mapy s pinmi synchronizovanými s filtrami, zoradenie (Odporúčané / Najbližšie / Najlepšie hodnotené), karty miest, spodná navigácia Domov · Hľadať · Obľúbené · Profil.
- 11 syntetických miest označených DEMO (Bratislava a okolie), skóre 1–10, rozlíšenie overených a neoverených údajov, neznáme ceny a hodiny sa zobrazujú ako „neoverené“, nie ako negatívne.
- Stavy: načítanie (skeleton), prázdny výsledok (so Simonkinou ilustráciou), chyba s „Skúsiť znova“. Na testovanie `?stav=nacitanie` a `?stav=chyba`.
- Pracovné dizajnové tokeny (farebný smer B s tmavšími variantmi pre text, zjednotené s DESIGN_SYSTEM_PROPOSAL v PR #1) v `src/app/globals.css`, písmo Plus Jakarta Sans.
- Simonkine ilustrácie `public/illustrations/` (so súhlasom vlastníka).

**Otestované**
- `npm test` (7 testov: filtre, vyhľadávanie bez diakritiky, zoradenie, formátovanie, DEMO označenie), `npm run typecheck`, `npm run lint`, `npm run build` — všetko prešlo.
- Playwright (Chromium, emulácia iPhone 13 a 320 px, desktop 1280 px): filter Ihriská + 0–3 roky = 3 miesta (pred zmenou vekových skupín), hľadanie „kaviaren“ = 4, prázdny stav a „Zrušiť filtre“, ťuk na pin zvýrazní kartu, chyba → „Skúsiť znova“ → 11 miest, bez horizontálneho scrollu na 320 px, bez chýb v konzole. Screenshoty v `docs/screenshots/`.
- Kontrast textových farieb prepočítaný podľa WCAG (všetky textové páry ≥ 4,5 : 1).

**Známe obmedzenia**
- Mapa je statická ilustrácia (mapový provider je otvorené rozhodnutie). „Celá mapa“, detail miesta, Obľúbené a Profil zatiaľ zobrazia len oznámenie „pripravujeme“.
- Obľúbené sa držia iba v pamäti stránky (po obnovení zmiznú).
- Fotografie miest nahrádzajú abstraktné ilustračné náhľady.
- Netestované na fyzickom iPhone ani v Safari (iba Chromium emulácia).

## 2026-11-21 — Nastavenie projektu
- Vytvorený základ verejného repozitára KUTISKO.
- Pridané README, CLAUDE.md a .gitignore.
- Aktualizované pravidlá Claude Code: agilné iterácie, dôraz na UX/UI, evidencia zmien a rozhodnutí.
- Overené: súbory vytvorené cez GitHub; funkčný prototyp zatiaľ neexistuje.
- Otvorené: doplniť úplné produktové dokumenty v1.7, dodať originálne ilustrácie osobitne.
