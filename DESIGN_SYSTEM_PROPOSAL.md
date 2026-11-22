# KUTISKO — Design System Proposal

Status: **návrh v0.1** (2026-11-22). Celý dokument je **[NÁVRH]**, pokiaľ nie je uvedené inak. Finálne tokeny, typografia a logo sú v manifeste otvorené a schvaľujú sa až po vizuálnom teste konceptu Domov.

Schválené vstupy z `PRODUCT_MANIFESTO.md` v1.7:
- aplikácia pre rodičov: funkčná, elegantná, vzdušná, dôveryhodná [19]
- farebný smer B (krémová, koralová, žltá, tyrkysová), používaný s mierou [13, 20]
- obsah (fotky, vyhľadávanie, filtre, mapa, praktické údaje) má prednosť pred dekoráciou [25]
- Simonkine ilustrácie výberovo, bez prekresľovania [21]
- logo nie je finálne [23]

## 1. Princípy
1. **Obsah navrchu.** Fotografie miest a praktické údaje sú hlavný vizuál. Farba slúži orientácii a akcii, nie výzdobe.
2. **Pokoj, potom energia.** Neutrálne plochy (biela, krémová) tvoria ~85 % plochy. Koralová je takmer výhradne primárna akcia a aktívny stav. Žltá a tyrkysová sú doplnkové akcenty.
3. **Dôvera viditeľne.** Overené / neoverené / neuvedené údaje majú konzistentný vizuálny jazyk. Neznámy údaj nikdy nevyzerá ako negatívny.
4. **Prístupnosť je podmienka.** WCAG 2.1 AA pre text a ovládacie prvky, dotykové plochy min. 44×44 px, viditeľný focus, `prefers-reduced-motion`.
5. **Jedna ruka.** Kľúčové akcie v dolnej polovici obrazovky, spodná navigácia, veľké dotykové plochy.

## 2. Farby

### 2.1 Pracovná paleta B (z manifestu) a jej kontrast
Pôvodné HEX hodnoty z manifestu sú **dekoratívne/brand odtiene**. Overenie kontrastu (WCAG 2.1, vypočítané podľa vzorca relatívnej luminancie):

| Farba | HEX | na bielej | na krémovej `#FFF8E7` | Použiteľnosť pre text |
|-------|-----|-----------|------------------------|-----------------------|
| Vibrant Coral | `#FF526E` | 3.14 : 1 | 2.97 : 1 | ❌ text; len veľké plochy/ikony s doplnkovým popisom |
| Sunny Yellow | `#F5AD1D` | 1.93 : 1 | 1.82 : 1 | ❌ nikdy text ani jediný nosič informácie |
| Bright Turquoise | `#5DC2D6` | 2.07 : 1 | 1.95 : 1 | ❌ nikdy text ani jediný nosič informácie |
| Warm Cream | `#FFF8E7` | — | — | pozadie |

Záver: pôvodné odtiene ostávajú pre ilustrácie, piny na mape s tmavým obrysom, pozadia odznakov a dekor. Pre text a ovládacie prvky sú navrhnuté **tmavšie odtiene** nižšie.

### 2.2 Navrhované UI tokeny

**Neutrálne**

| Token | HEX | Použitie | Kontrast (biela / krémová / sand) |
|-------|-----|----------|-----------------------------------|
| `color.bg.canvas` | `#FFF8E7` | pozadie aplikácie (Warm Cream) | — |
| `color.bg.surface` | `#FFFFFF` | karty, sheety, vstupy | — |
| `color.bg.subtle` | `#F4EEE2` | sekundárne plochy, skeletony | — |
| `color.text.primary` | `#1F1A17` | nadpisy, telo | 17.24 / 16.28 / 14.92 ✅ AAA |
| `color.text.secondary` | `#5C534C` | metadáta, popisky | 7.51 / 7.09 / 6.50 ✅ AAA |
| `color.text.muted` | `#6B625A` | pomocný text, placeholder | 5.97 / 5.63 / 5.16 ✅ AA |
| `color.border.subtle` | `#E8E0D2` | dekoratívne oddeľovače (nie hranica ovládacieho prvku) | 1.31 / 1.24 — len dekor |
| `color.border.control` | `#8C8278` | hranica vstupov, checkboxov | 3.76 / 3.55 / 3.26 ✅ ≥ 3:1 (non-text) |

**Akcentové — text a ovládacie prvky**

| Token | HEX | Použitie | Kontrast (biela / krémová / sand) |
|-------|-----|----------|-----------------------------------|
| `color.accent.coral.600` | `#D6264A` | primárne tlačidlo (biely text), aktívna ikona v navigácii, odkaz | biely text na nej 4.96 ✅; ako text 4.96 / 4.68 / 4.29* |
| `color.accent.coral.700` | `#B81E3E` | pressed stav, malý koralový text na farebných plochách | 6.38 / 6.02 / 5.52 ✅ |
| `color.accent.turquoise.700` | `#0E6B7D` | sekundárne akcie, „Overené“, mapové prvky s textom | 6.14 / 5.80 / 5.32 ✅ |
| `color.accent.turquoise.800` | `#0B5866` | text na tyrkysových tintách | 8.07 / 7.62 / 6.98 ✅ |
| `color.accent.yellow.700` | `#8A5A00` | text na žltých tintách (napr. „Návrh komunity“) | 5.93 / 5.60 / 5.13 ✅ |

\* `coral.600` ako text na `bg.subtle` je 4.29 : 1 → len pre veľký text (≥ 24 px alebo ≥ 18.66 px tučne). Malý koralový text na `bg.subtle` používa `coral.700`.

**Tinty (pozadia odznakov a chipov)** — text na nich vždy z riadku vyššie

| Token | HEX | Text na nej | Kontrast |
|-------|-----|-------------|----------|
| `color.tint.coral` | `#FFECEF` | `coral.700` | 5.62 ✅ |
| `color.tint.yellow` | `#FEF3D6` | `yellow.700` | 5.36 ✅ |
| `color.tint.turquoise` | `#E4F5F8` | `turquoise.800` | 7.19 ✅ |

**Brand (dekor, nie text)**: `color.brand.coral #FF526E`, `color.brand.yellow #F5AD1D`, `color.brand.turquoise #5DC2D6`. Tmavý text `#1F1A17` na nich spĺňa AA (5.49 / 8.93 / 8.33), takže sú prípustné ako výplň veľkých prvkov s tmavým textom, napr. vybraný pin na mape.

**Stavové**

| Token | HEX | Kontrast na bielej |
|-------|-----|--------------------|
| `color.status.success` | `#1E7A4C` | 5.33 ✅ |
| `color.status.error` | `#B3261E` | 6.54 ✅ |

Chyba sa vždy oznamuje aj textom a ikonou, nie iba farbou.

### 2.3 Pravidlá použitia
- Na jednej obrazovke najviac **jedna** dominantná koralová akcia.
- Kategórie miest sa nerozlišujú iba farbou: vždy ikona + text.
- Mapové piny: brand farba výplne + tmavý obrys + ikona kategórie; vybraný pin je väčší, nie len inak sfarbený.
- Tmavý režim: mimo rozsahu prototypu.

Overenie: hodnoty vypočítané skriptom podľa WCAG 2.1 (relatívna luminancia). Pred schválením overiť aj vizuálne na iPhone v dennom svetle.

## 3. Typografia [NÁVRH — otvorené rozhodnutie]

Požiadavky: plná podpora slovenskej diakritiky (ľ, ĺ, ŕ, ô, ä, ť, ď, ň), dobrá čitateľnosť v malých veľkostiach, otvorená licencia, variabilný font kvôli veľkosti.

| Variant | Nadpisy | Text | Charakter |
|---------|---------|------|-----------|
| **A (odporúčaný)** | Plus Jakarta Sans | Plus Jakarta Sans | moderný, priateľský, mierne zaoblený; jedna rodina = menej KB |
| B | Fraunces (soft) | Inter | elegantnejší kontrast serif/sans, viac „prémiový“ |
| C | Nunito | Inter | najhravejší, riziko „detského“ dojmu |

Všetky varianty sú pod SIL Open Font License a podporujú latin-ext. Načítanie cez `next/font` (self-hosting, bez externej požiadavky za behu). Systémový fallback: `-apple-system, "Segoe UI", Roboto, sans-serif`.

**Typografická škála** (mobil, rem pri 16 px)

| Token | Veľkosť / riadkovanie | Váha | Použitie |
|-------|------------------------|------|----------|
| `display` | 32 / 38 | 700 | uvítanie, hero |
| `title.l` | 24 / 30 | 700 | nadpis obrazovky |
| `title.m` | 20 / 26 | 650 | nadpis sekcie, názov v detaile |
| `title.s` | 17 / 22 | 650 | názov na karte |
| `body` | 16 / 24 | 400 | telo textu |
| `body.s` | 14 / 20 | 450 | metadáta |
| `label` | 13 / 16 | 600 | chipy, odznaky, tlačidlá v toolbare |
| `caption` | 12 / 16 | 500 | výnimočne; nikdy dôležitý údaj |

Minimum pre text v rozhraní: 12 px; vstupné polia 16 px (zabráni auto-zoomu v iOS Safari). Podpora dynamickej veľkosti: všetko v `rem`.

## 4. Priestor, mriežka, tvary

- **Základná jednotka 4 px.** Škála: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Okraj obrazovky: 20 px (mobil), max. šírka obsahu 480 px na väčších displejoch, centrované.
- Medzi sekciami 32 px, v rámci sekcie 12–16 px.
- **Zaoblenie:** `radius.s 8` (chip, odznak), `radius.m 12` (vstup, malé tlačidlo), `radius.l 20` (karta, fotka), `radius.xl 28` (bottom sheet), `radius.full` (pill tlačidlá, vyhľadávanie).
- **Tiene:** jemné a teplé, napr. `0 1px 2px rgb(31 26 23 / 6%), 0 8px 24px rgb(31 26 23 / 6%)`. Žiadne ostré tiene.
- **Dotykové plochy:** min. 44×44 px, medzi susednými cieľmi min. 8 px.

## 5. Komponenty (prvá sada pre Domov)

| Komponent | Kľúčové vlastnosti |
|-----------|--------------------|
| `SearchField` | pill, 52 px výška, ikona lupy, placeholder `text.muted`, tlačidlo vymazať, `role="search"` |
| `FilterChip` | prepínač s `aria-pressed`; neaktívny: biela + `border.control`; aktívny: `text.primary` výplň + biely text (17:1) |
| `PlaceCard` | fotka 16:10 `radius.l`, názov `title.s`, riadok metadát (kategória · mestská časť · vzdialenosť), hodnotenie, vek, `VerificationBadge`, tlačidlo Uložiť (44 px) |
| `RatingPill` | „8,4 · 23 hodnotení“; ak `count` < prah, text „Málo hodnotení“ [NÁVRH — prah otvorený] |
| `VerificationBadge` | Overené (tyrkysová tinta), Neoverené (neutrálna), Návrh komunity (žltá tinta); vždy ikona + text |
| `UnknownValue` | „Neuvedené“ v `text.muted`, neutrálna ikona; nikdy červená ani preškrtnutá |
| `MapPreview` | výška ~180 px, `radius.l`, tlačidlo „Celá mapa“; v Fáze A statický placeholder |
| `SortControl` | segmented control alebo menu; aktuálny stav čitateľný screen readerom |
| `BottomNav` | 3 položky (Hľadať, Uložené, Profil), ikona + text, aktívna `coral.600`, výška 64 px + safe area |
| `DemoBanner` | nenápadný, ale stále viditeľný štítok „DEMO dáta“ |
| `EmptyState` / `ErrorState` | krátky nadpis, vysvetlenie, jedna akcia; tu je vhodné miesto pre ilustráciu |
| `Skeleton` | `bg.subtle`, bez blikania pri `prefers-reduced-motion` |
| `NavigateSheet` | bottom sheet s Apple Maps / Google Maps / Waze, bez tvrdenia „nainštalované“ |

Stavy pre každý interaktívny prvok: default, hover (desktop), pressed, focus-visible (2 px obrys `turquoise.700` + 2 px odsadenie), disabled, loading.

## 6. Ikony a ilustrácie
- **Ikony:** jedna knižnica s konzistentnou hrúbkou čiary, napr. Lucide (MIT) [NÁVRH]. Veľkosť 20/24 px.
- **Ilustrácie (Simonka):** len úvod, prázdne stavy, úspech po akcii a výnimočné mikrodetaily. Nie v zozname výsledkov ani v detaile nad fotografiami. Neupravovať štýl bez súhlasu autorky. [SCHVÁLENÉ 21]
- Ilustrácie sa do verejného repozitára necommitujú, kým to vlastník výslovne nepovolí. V prototype dovtedy neutrálny placeholder.

## 7. Pohyb
- Krátke prechody 150–250 ms, `ease-out`; bottom sheet s jemnou pružinou.
- Bez dekoratívnych animácií pri načítaní. Rešpektovať `prefers-reduced-motion`.

## 8. Implementácia
- Tokeny ako CSS premenné v `:root` a namapované v Tailwind konfigurácii (`colors`, `spacing`, `borderRadius`, `fontSize`), aby sa dali neskôr zmeniť na jednom mieste.
- Názvy tokenov sémantické (`text.secondary`), nie podľa odtieňa, aby zmena palety nevyžadovala zmenu komponentov.

## 9. Otvorené rozhodnutia (na schválenie po koncepte Domov)
1. Typografia — variant A / B / C.
2. Finálne UI tokeny — potvrdiť tmavšie odtiene (`coral.600`, `turquoise.700`, `yellow.700`) po teste na zariadení.
3. Mapový provider a vizuál mapy — pozri `MVP_ROADMAP.md`.
4. Vekové kategórie a ich zobrazenie na karte (napr. „1–6 r.“).
5. KUTISKO skóre 1–5 — vizuál sa nenavrhuje, kým nie je metodika (manifest: nezobrazovať ako rating bez metodiky).
6. Logo — dočasný textový wordmark v `title.l`, 700.
7. Rozsah a umiestnenie ilustrácií.
