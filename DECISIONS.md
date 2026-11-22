# Product & technical decisions

## 2026-11-21 — Verejný repozitár pre prototyp
**Rozhodnutie:** GitHub repozitár ostáva verejný. Originálne ilustrácie dodá vlastník samostatne Claude Code a nezverejnia sa bez súhlasu.
**Dôvod:** Zjednodušenie prístupu pri prototypovaní; ochrana autorských podkladov.
**Dopad:** Dokumentácia a kód sú verejne dostupné. Žiadne tajomstvá ani osobné údaje.

## 2026-11-21 — Agilný UX-first vývoj
**Rozhodnutie:** Claude Code pracuje samostatne v krátkych iteráciách, priebežne testuje a zlepšuje. Kvalitné, vzdušné UI pre rodičov je podmienka, nie dodatočná úprava.
**Dôvod:** Rýchlejší postup bez mikroschvaľovania a bez straty kvality.
**Dopad:** Skorá spätná väzba na Home, potom ďalšie obrazovky; zásadné zmeny a backend vyžadujú schválenie.

## 2026-11-21 — Projektová evidencia
**Rozhodnutie:** Commity + CHANGELOG.md + DECISIONS.md; úlohy a chyby podľa potreby v GitHub Issues.
**Dôvod:** Dohľadateľnosť práce, rozhodnutí a testov.

## 2026-11-22 — Technický základ prototypu
**Rozhodnutie:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, statický export stránky, žiadny backend. Testy logiky cez vstavaný `node --test` (bez ďalšej testovacej knižnice).
**Dôvod:** Preferovaná technológia podľa CLAUDE.md; minimum závislostí.
**Alternatívy:** Vite + React (menej vhodné pre neskorší Vercel/PWA), Vitest/Jest (zbytočná závislosť v tejto fáze).
**Dopad:** `npm run dev / build / lint / typecheck / test`.

## 2026-11-22 — Ilustrácie dievčatka v repozitári
**Rozhodnutie (Martin):** Simonkine ilustrácie dievčatka (`dieta01.png`, `dieta02.png`) sa môžu nahrať do verejného repozitára.
**Dopad:** Uložené ako `public/illustrations/dieta-kocky.png` a `dieta-lopta.png`; na Domov striedmo v hlavičke a v prázdnom stave.

## 2026-11-22 — Písmo (pracovný návrh)
**Rozhodnutie:** Martin nechal výber písma na Claude. Pracovne Plus Jakarta Sans (Google Fonts, OFL, cez `next/font` — hostované spolu s aplikáciou). Finálne potvrdenie v rámci `DESIGN_SYSTEM_PROPOSAL.md`.
**Dôvod:** Moderné, priateľské, nie detské; výborná čitateľnosť na mobile a plná podpora slovenskej diakritiky.
**Alternatívy:** Inter (neutrálnejší, menej charakteru), Nunito (príliš hravé pre rodičovské UI), systémové SF Pro (nekonzistentné mimo Apple).

## 2026-11-22 — Domov v1: kľúčové UI voľby (návrh na schválenie)
**Rozhodnutie:** Svetlé krémové pozadie (#FBF7EE), biele karty, farby B len ako akcenty. Koralová #FF526E iba dekoratívne (piny, srdiečko); na text a tlačidlá tmavšia #C8243F. Amber spodnú lištu z mockupu nahrádza biela lišta s amber indikátorom (biely text na #F5AD1D nespĺňa kontrast). Mapa je ilustračná SVG s pinmi z GPS fixtures. Fotky miest nahrádzajú abstraktné náhľady podľa kategórie. Vzdialenosť sa počíta od centra Bratislavy, poloha sa nezisťuje.
**Dôvod:** Manifest body 19, 20, 25 (obsah pred dekoráciou, kontrast); bez mapového providera a licencovaných fotografií.
**Dopad:** Čaká na vizuálne schválenie Martina (manifest, bod 24) pred ďalšími obrazovkami.
