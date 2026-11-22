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
Stavy na testovanie: `/?stav=nacitanie`, `/?stav=chyba`. Všetky miesta sú syntetické (DEMO).

## Dokumentácia
- `PRODUCT_MANIFESTO.md` — produktová špecifikácia (pripravuje sa nahratie v1.7)
- `PROTOTYPE_BRIEF.md` — rozsah prototypu (pripravuje sa)
- `DESIGN_SYSTEM_PROPOSAL.md` — vizuálny smer (pripravuje sa)
- `MVP_ROADMAP.md` — fázy realizácie (pripravuje sa)
- `CLAUDE.md` — agilný vývoj, kvalita UX/UI a pravidlá Git
- `CHANGELOG.md` — prehľad dokončených zmien
- `DECISIONS.md` — rozhodnutia a dôvody

## Vývojový režim
Claude Code postupuje v krátkych cykloch **implementácia → test → zlepšenie**. Začína spustiteľným konceptom obrazovky Domov a vyžiada si skorú spätnú väzbu; pri bežných detailoch pokračuje samostatne. Backend až po schválení.

## Bezpečnosť
Repozitár je verejný. Necommitovať heslá, API kľúče, osobné údaje, fotografie detí ani originálne ilustrácie bez výslovného súhlasu.
