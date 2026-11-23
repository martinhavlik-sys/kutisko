# Ikona aplikácie — čo dodať pri výmene

Súčasná ikona „k“ je **dočasná**. Keď bude finálne logo, stačí prepísať súbory
v `public/icons/` **rovnakými názvami a rozmermi**. Kód ani manifest netreba meniť.

| Súbor | Rozmer | Kde sa použije | Pravidlá |
|---|---|---|---|
| `icon-512.png` | 512 × 512 | Android (inštalácia, úvodná obrazovka), prehliadače | Plné pozadie (nie priehľadné), logo s okrajom ~10 % |
| `icon-192.png` | 192 × 192 | Android, karta „Kutisko na ploche“ v Profile | To isté ako 512, len zmenšené |
| `icon-maskable-512.png` | 512 × 512 | **Android plocha** (systém ju oreže do kruhu, štvorca alebo „kvapky“ podľa telefónu) | Pozadie cez celú plochu. Všetko dôležité (logo) **v strednom kruhu s priemerom 80 %** (≈ 410 px). Okraje môžu byť odrezané. |
| `icon-maskable-192.png` | 192 × 192 | To isté pre menšie displeje | Zmenšená verzia maskable 512 |
| `apple-touch-icon.png` | 180 × 180 | iPhone „Pridať na plochu“ | Plné pozadie, bez zaoblenia (iPhone zaoblí sám), bez priehľadnosti |
| `shortcut-search-192.png`, `shortcut-heart-192.png` | 192 × 192 | Skratky po dlhom podržaní ikony na Androide („Hľadať“, „Obľúbené“) | Netreba meniť; voliteľne v novom štýle |

**Najjednoduchšie pre grafika:** dodať jeden štvorcový podklad **1024 × 1024 px (PNG alebo SVG)**
s logom v strede tak, aby sa zmestilo do kruhu s priemerom ~800 px, a farbu pozadia.
Z neho sa vyrežú všetky veľkosti vyššie.

Skontrolovať orezanie: <https://maskable.app/editor> (nahrať `icon-maskable-512.png`).

Farba pozadia úvodnej obrazovky a horného pruhu na Androide je krémová `#fbf7ee`
(`src/app/manifest.ts`, `background_color` a `theme_color`). Ak bude logo na inej farbe, zmeňte ju tam.
