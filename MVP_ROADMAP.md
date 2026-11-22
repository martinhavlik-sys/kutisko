# KUTISKO — MVP Roadmap

Status: **návrh v0.1** (2026-11-22). Fázy a poradie vychádzajú zo schváleného „Aktuálneho poradia realizácie“ v `PRODUCT_MANIFESTO.md` v1.7. Obsah fáz 3–5, odhady a odporúčania sú **[NÁVRH]**; rozsah produkčného MVP je v manifeste stále otvorený.

Termíny nie sú stanovené; fázy sa posúvajú po splnení výstupnej brány, nie podľa kalendára.

## Prehľad

| Fáza | Cieľ | Výstupná brána | Stav |
|------|------|----------------|------|
| 0 | Zjednotená dokumentácia | dokumenty v repozitári, referencie overené | prebieha |
| 1 | Koncept obrazovky Domov | vlastník schváli vizuálny jazyk | čaká |
| 2 | Klikateľný prototyp | všetky toky z `PROTOTYPE_BRIEF.md` fungujú s DEMO dátami | čaká |
| 3 | Test na iPhone a úpravy | scenáre S1–S8 prejdú, tokeny a navigácia potvrdené | čaká |
| 4 | Rozhodnutia pred backendom | uzavretý provider mapy, dáta, súkromie, akceptačné kritériá | čaká |
| 5 | Produkčné MVP | uzavretý pilot v Bratislave | vyžaduje samostatné schválenie |

## Fáza 0 — Dokumentácia
- [x] `PRODUCT_MANIFESTO.md` v1.7, `CLAUDE.md`, `CHANGELOG.md`, `DECISIONS.md`
- [x] Overené, že grafické referencie sú dostupné v projektových súboroch (2026-11-22)
- [x] `PROTOTYPE_BRIEF.md`, `DESIGN_SYSTEM_PROPOSAL.md`, `MVP_ROADMAP.md` (návrhy)
- [ ] Vlastník prejde návrhy a označí, čo schvaľuje

## Fáza 1 — Koncept Domov
- Next.js + TypeScript + Tailwind, tokeny z `DESIGN_SYSTEM_PROPOSAL.md`
- 10–15 syntetických miest v Bratislave (DEMO)
- Vyhľadávanie, filter kategórie, náhľad mapy (statický), zoznam kariet, zoradenie
- Stavy loading / empty / error / bez polohy
- Kontroly: lint, typecheck, build, mobilný viewport, klávesnica, kontrast
- Výstup: spustiteľná ukážka (lokálne; náhľad na Verceli po súhlase vlastníka)
- **Brána:** vlastník schváli hierarchiu, typografiu, farby, karty, rozostupy a mieru ilustrácií [manifest 24]

## Fáza 2 — Klikateľný prototyp
Poradie rezov (každý rez = funkčná obrazovka + test + záznam v CHANGELOG):
1. Rozšírené vyhľadávanie a filtre (vek, vnútri/vonku, vybavenie), synchronizovaná plná mapa/zoznam
2. Detail miesta + výber externej navigácie (Apple Maps / Google Maps / Waze, webový fallback)
3. Uložené (lokálne)
4. Profil a voliteľné preferencie (vek, lokalita, vzdialenosť; preskočiť/zmeniť/vymazať)
5. Simulované hodnotenie (1–10 + voliteľné kritériá + text)
6. Simulovaný návrh miesta a pridanie fotografie
7. Náhľad admin fronty (návrhy, fotografie, nahlásenia)
8. Simulovaná registrácia/prihlásenie, uvítacia obrazovka
- **Brána:** všetky toky z bodu 16 manifestu klikateľné, všetko jasne DEMO

## Fáza 3 — Test na iPhone
- Scenáre S1–S8 z `PROTOTYPE_BRIEF.md` s 3–5 rodičmi [NÁVRH — počet respondentov]
- Zaznamenať zistenia ako GitHub Issues; opraviť kritické a vysoké
- Potvrdiť dizajnové tokeny a návrh navigácie
- **Brána:** vlastník schváli UX [manifest, „Brána medzi prototypom a backendom“]

## Fáza 4 — Rozhodnutia pred backendom
Každé rozhodnutie sa zapíše do `DECISIONS.md`.

| Téma | Návrh na posúdenie | Pozn. |
|------|--------------------|-------|
| **Mapový provider** — klient MapLibre GL [SCHVÁLENÉ 2026-11-22]; poskytovateľ dlaždíc [NÁVRH] | Porovnať **MapLibre GL + OpenStreetMap dlaždice od komerčného poskytovateľa (napr. MapTiler)**, **Mapbox** a **Google Maps Platform**. Kritériá: cena pri pilotnom objeme, licencia a atribúcia OSM, vizuálna prispôsobiteľnosť štýlu, podmienky ukladania dát, kvalita v SR. Predbežné odporúčanie: MapLibre (open-source klient, výmena poskytovateľa dlaždíc bez prepisovania kódu). | Ceny a limity overiť v aktuálnych cenníkoch pred rozhodnutím; ide o platenú službu → schvaľuje vlastník. |
| **Zdroje dát o miestach** | Vlastný kurátorovaný katalóg ako základ, OSM (ODbL) ako pomocný zdroj s atribúciou, komunitné návrhy. Evidovať `source` a `verification`. | manifest 3 |
| **Pilotná oblasť a počet miest** | Bratislava (všetky mestské časti) + vybrané obce okolia; 50–100 overených miest na štart. | otvorené v manifeste |
| **Vekové kategórie** [SCHVÁLENÉ 2026-11-22] | Filtrovacie skupiny 0–2, 3–5, 6–10, 10+; miesto ukladá rozsah min–max, filter hľadá prekrytie. | otvorené v manifeste |
| **Hodnotenia pri nízkom počte** [NÁVRH] | Pod 3 hodnotenia zobraziť „Málo hodnotení“ namiesto priemeru; pri zoraďovaní použiť bayesovský priemer. | otvorené v manifeste |
| **KUTISKO skóre 1–5** [SCHVÁLENÉ 2026-11-22: nie v MVP] | Nezavádzať v MVP. Ak áno, len so zverejnenou metodikou (napr. úplnosť a overenie údajov), vizuálne odlíšené od hodnotenia rodičov. | manifest: nezobrazovať bez metodiky |
| **Backend** | Supabase (Postgres + RLS + Storage + Auth) podľa kontextu projektu. | manifest: RLS povinné |
| **Autentifikácia** | E-mail magic link + Sign in with Apple + Google. | otvorené v manifeste |
| **Súkromie a GDPR** | Minimalizácia údajov, retencia, export a vymazanie účtu, EXIF stripping fotografií. | manifest, Bezpečnosť |
| **Akceptačné kritériá MVP** | Spísať po Fáze 3 na základe zistení. | otvorené v manifeste |

## Fáza 5 — Produkčné MVP
Odporúčaný rozsah podľa manifestu (čaká na finálne potvrdenie):
- Povinná registrácia, základný profil, voliteľné preferencie
- Katalóg, detail, vyhľadávanie a filtre, kombinovaná mapa/zoznam
- Obľúbené, celkové a podrobné hodnotenia (ukladané oddelene)
- Návrhy miest, moderované fotografie
- Admin fronta: návrhy, fotografie, nahlásenia, úpravy katalógu, audit zásahov
- Pilotné dáta Bratislava a okolie → uzavreté testovanie → verejný pilot

**Mimo MVP:** rezervácie, účty prevádzkovateľov, platené profily, reklama, AI odporúčania, offline mapy, zdieľané kolekcie.

## Riziká

| Riziko | Dopad | Zmiernenie |
|--------|-------|------------|
| Nedostatok overených dát o miestach | prázdna/nedôveryhodná aplikácia | kurátorovaný štart, jasné označenie neoverených údajov |
| Licenčné obmedzenia mapy a externých dát | právne riziko, náklady | rozhodnutie vo Fáze 4 pred importom dát |
| Fotografie s identifikovateľnými deťmi | GDPR, dôvera | moderácia pred zverejnením, nahlásenie, odstránenie |
| Povinná registrácia znižuje prvé použitie | nižšia konverzia | overiť v teste; manifest ju zatiaľ ponecháva ako schválenú |
| Rozsah prototypu narastá | oneskorenie | vertikálne rezy, brány podľa tejto roadmapy |
