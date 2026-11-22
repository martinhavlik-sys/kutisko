# Changelog

## 2026-11-22 — Doplnené projektové dokumenty (návrhy)
- Pridané `PROTOTYPE_BRIEF.md`: účel, rozsah a poradie prototypu, obsah konceptu Domov, testovacie scenáre S1–S8, pravidlá DEMO dát, akceptačné kritériá.
- Pridané `DESIGN_SYSTEM_PROPOSAL.md`: princípy, farebné UI tokeny odvodené z palety B s tmavšími odtieňmi pre text, typografické varianty, škála, priestor, komponenty pre Domov.
- Pridané `MVP_ROADMAP.md`: fázy 0–5 s výstupnými bránami, návrhy na rozhodnutia pred backendom (mapový provider, vekové kategórie, KUTISKO skóre), riziká.
- Aktualizované `README.md` (stav dokumentov) a `DECISIONS.md`.
- Po spätnej väzbe vlastníka: zvolená typografia Plus Jakarta Sans, logo ponechané bez zmeny, pridaná ilustrácia dievčatka do `assets/illustrations/` (so súhlasom, bez metadát).
- Overené: kontrastné pomery všetkých navrhnutých textových tokenov vypočítané podľa vzorca WCAG 2.1 (relatívna luminancia); textové tokeny spĺňajú AA na bielej, krémovej a `bg.subtle` s výnimkou `coral.600` na `bg.subtle` (4.29 : 1, len pre veľký text, uvedené v dokumente). Overená dostupnosť grafických referencií v projektových súboroch.
- Neoverené: vizuálny test farieb a typografie na zariadení (čaká na koncept Domov).
- Známe obmedzenia: finálne tokeny, mapový provider, vekové filtre a KUTISKO skóre sú len návrhy; aplikácia zatiaľ neexistuje.

## 2026-11-21 — Nastavenie projektu
- Vytvorený základ verejného repozitára KUTISKO.
- Pridané README, CLAUDE.md a .gitignore.
- Aktualizované pravidlá Claude Code: agilné iterácie, dôraz na UX/UI, evidencia zmien a rozhodnutí.
- Overené: súbory vytvorené cez GitHub; funkčný prototyp zatiaľ neexistuje.
- Otvorené: doplniť úplné produktové dokumenty v1.7, dodať originálne ilustrácie osobitne.
