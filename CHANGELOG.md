# Changelog

## 2026-11-22 — Koncept obrazovky Domov v1 (prototyp)
**Zmenené**
- Založený projekt Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, bez ďalších runtime závislostí.
- Obrazovka Domov: hlavička s dočasným wordmarkom, pozdrav „Kam ideme dnes?“, vyhľadávanie, filtre kategórií (Všetko / Kútiky / Herne / Ihriská) a veku (0–3, 3–6, 6–10, 10+), ilustračný náhľad mapy s pinmi synchronizovanými s filtrami, zoradenie (Odporúčané / Najbližšie / Najlepšie hodnotené), karty miest, spodná navigácia Domov · Hľadať · Obľúbené · Profil.
- 11 syntetických miest označených DEMO (Bratislava a okolie), skóre 1–10, rozlíšenie overených a neoverených údajov, neznáme ceny a hodiny sa zobrazujú ako „neoverené“, nie ako negatívne.
- Stavy: načítanie (skeleton), prázdny výsledok (so Simonkinou ilustráciou), chyba s „Skúsiť znova“. Na testovanie `?stav=nacitanie` a `?stav=chyba`.
- Pracovné dizajnové tokeny (farebný smer B s tmavšími variantmi pre text) v `src/app/globals.css`, písmo Plus Jakarta Sans.
- Simonkine ilustrácie `public/illustrations/` (so súhlasom vlastníka).

**Otestované**
- `npm test` (7 testov: filtre, vyhľadávanie bez diakritiky, zoradenie, formátovanie, DEMO označenie), `npm run typecheck`, `npm run lint`, `npm run build` — všetko prešlo.
- Playwright (Chromium, emulácia iPhone 13 a 320 px, desktop 1280 px): filter Ihriská + 0–3 roky = 3 miesta, hľadanie „kaviaren“ = 4, prázdny stav a „Zrušiť filtre“, ťuk na pin zvýrazní kartu, chyba → „Skúsiť znova“ → 11 miest, bez horizontálneho scrollu na 320 px, bez chýb v konzole. Screenshoty v `docs/screenshots/`.
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
