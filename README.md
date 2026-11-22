# KUTISKO

Mobil-first aplikácia pre rodičov na objavovanie detských kútikov, vnútorných herní a vonkajších ihrísk. Pilot Bratislava a okolie.

## Stav
Živý prototyp: **https://kutisko.vercel.app/** — skutočné verejné ihriská z OpenStreetMap, kútiky a herne zatiaľ DEMO.

Príprava interaktívneho dizajnového prototypu. Zatiaľ bez produkčného backendu a reálnych používateľských dát.

## Spustenie
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testy logiky vyhľadávania a filtrov
npm run lint && npm run typecheck && npm run build
```
Stavy na testovanie: `/?stav=nacitanie`, `/?stav=chyba`. Obrazovky: `/`, `/hladat` (aj `?zobrazenie=mapa`), `/miesto/demo-01`, `/ulozene`, `/profil`, `/registracia`, `/prihlasenie`, `/vitaj`. Ihriská (`/miesto/osm-…`) sú skutočné z OpenStreetMap; kútiky a herne (`demo-…`), hodnotenia a recenzie sú syntetické (DEMO).

## Dáta o ihriskách (OpenStreetMap)
- `npm run import:osm` stiahne verejné ihriská Bratislavy a okolia z Overpass API do `src/data/osm/playgrounds.json` a porovná ich s otvorenými dátami mesta (`src/data/osm/city-crosscheck.json`). Bez kľúča a bez platenej služby.
- To isté robí GitHub Action **Import ihrísk (OSM)** (ručne cez „Run workflow“ alebo pri zmene `scripts/osm/`); výsledok commitne do vetvy.
- Dáta © prispievatelia OpenStreetMap, licencia [ODbL](https://www.openstreetmap.org/copyright). Atribúcia je v aplikácii na karte, v detaile a na Domove.

## Dokumentácia
- `PRODUCT_MANIFESTO.md` — produktová špecifikácia v1.7
- `PROTOTYPE_BRIEF.md` — rozsah prototypu (návrh)
- `DESIGN_SYSTEM_PROPOSAL.md` — dizajnový systém a tokeny (návrh)
- `MVP_ROADMAP.md` — fázy realizácie (návrh)
- `CLAUDE.md` — agilný vývoj, kvalita UX/UI a pravidlá Git
- `CHANGELOG.md` — prehľad dokončených zmien
- `DECISIONS.md` — rozhodnutia a dôvody

## Vývojový režim
Claude Code postupuje v krátkych cykloch **implementácia → test → zlepšenie**. Začína spustiteľným konceptom obrazovky Domov a vyžiada si skorú spätnú väzbu; pri bežných detailoch pokračuje samostatne. Backend až po schválení.

## Bezpečnosť
Repozitár je verejný. Necommitovať heslá, API kľúče, osobné údaje, fotografie detí ani originálne ilustrácie bez výslovného súhlasu.

## Nasadenie (Vercel)
Vercel → Add New → Project → import `martinhavlik-sys/kutisko` → Framework Next.js (predvolené nastavenia, bez premenných prostredia) → Deploy. Build spúšťa `npm run build` (vrátane `prebuild`, ktorý kopíruje worker MapLibre). Produkčná adresa sleduje vetvu `main`; náhľady PR vyžadujú prihlásenie do Vercelu.
