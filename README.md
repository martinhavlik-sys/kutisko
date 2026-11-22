# KUTISKO

Mobil-first aplikácia pre rodičov na objavovanie detských kútikov, vnútorných herní a vonkajších ihrísk. Pilot Bratislava a okolie.

## Stav
Príprava interaktívneho dizajnového prototypu. Zatiaľ bez produkčného backendu a reálnych používateľských dát.

## Spustenie
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testy logiky vyhľadávania a filtrov
npm run lint && npm run typecheck && npm run build
```
Stavy na testovanie: `/?stav=nacitanie`, `/?stav=chyba`. Obrazovky: `/`, `/hladat` (aj `?zobrazenie=mapa`), `/miesto/demo-01`, `/ulozene`, `/profil`, `/registracia`, `/prihlasenie`, `/vitaj`. Všetky miesta sú syntetické (DEMO).

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
