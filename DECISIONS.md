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
**Rozhodnutie:** Svetlé krémové pozadie (#FBF7EE), biele karty, farby B len ako akcenty. Koralová #FF526E iba dekoratívne (piny, srdiečko); na text a tlačidlá tmavšia #D6264A (zjednotené s tokenmi z PR #1). Amber spodnú lištu z mockupu nahrádza biela lišta s amber indikátorom (biely text na #F5AD1D nespĺňa kontrast). Mapa je ilustračná SVG s pinmi z GPS fixtures. Fotky miest nahrádzajú abstraktné náhľady podľa kategórie. Vzdialenosť sa počíta od centra Bratislavy, poloha sa nezisťuje.
**Dôvod:** Manifest body 19, 20, 25 (obsah pred dekoráciou, kontrast); bez mapového providera a licencovaných fotografií.
**Dopad:** Martin vizuálny smer 2026-11-22 schválil („je to v poriadku“); ďalšie obrazovky z neho vychádzajú.

## 2026-11-22 — Schválenie vizuálneho smeru Domov v1
**Rozhodnutie (Martin):** Vizuálny jazyk konceptu Domov v1 je schválený (manifest, bod 24).
**Dopad:** Pokračuje sa ďalšími obrazovkami podľa `MVP_ROADMAP.md` (Fáza 2), začína sa detailom miesta.

## 2026-11-22 — Detail miesta: navigácia a hodnotenie (návrh)
**Rozhodnutie:** Navigácia používa univerzálne webové URL (maps.apple.com, google.com/maps/dir s `api=1`, waze.com/ul) namiesto vlastných schém `comgooglemaps://` / `waze://`; otvárajú aplikáciu, ak je nainštalovaná, inak web. Služby sa neoznačujú ako „nainštalované“. Čiastkové hodnotenie zobrazuje tri kritériá z podkladu `hodnotenie.png` (čistota, kreativita priestoru, celkový dojem) oddelene od celkového skóre. „KUTISKO skóre 1–5“ sa nezobrazuje, kým nie je metodika.
**Dôvod:** Manifest bod 14 a sekcia „UX navigácia“; spoľahlivý fallback bez detekcie aplikácií.
**Alternatívy:** Vlastné URL schémy s detekciou (nespoľahlivé vo webe/PWA).
**Dopad:** Overiť na fyzickom iPhone v Safari a v nainštalovanej PWA.

## 2026-11-22 — Vek, mapa a KUTISKO skóre (schválené Martinom)
**Rozhodnutie (Martin):** Vekové skupiny 0–2, 3–5, 6–10, 10+; mapa cez MapLibre GL (poskytovateľ dlaždíc otvorený); KUTISKO skóre 1–5 nie je súčasťou MVP. Podrobne v `DECISIONS.md` z PR #1.
**Dopad na prototyp:** Filter veku upravený; plná mapa sa bude stavať na MapLibre GL; skóre 1–5 sa nikde nezobrazuje.

## 2026-11-22 — Mapové podklady pre prototyp: OpenFreeMap
**Rozhodnutie:** Prototyp používa MapLibre GL so štýlom OpenFreeMap „positron“ (bezplatné, bez API kľúča, dáta OpenStreetMap s atribúciou). URL štýlu je na jednom mieste (`src/components/map/PlacesMap.tsx`).
**Dôvod:** MapLibre GL schválil Martin; poskytovateľ dlaždíc ostáva otvorený a nemá vzniknúť platená služba bez schválenia.
**Alternatívy:** MapTiler, Stadia, vlastný hosting (rozhodnutie pred produkčným MVP).
**Dopad:** Žiadne náklady ani kľúče v repozitári; pri výbere produkčného poskytovateľa sa mení iba URL štýlu.

## 2026-11-22 — Stav filtrov v URL, obľúbené a preferencie v localStorage
**Rozhodnutie:** Filtre rozšíreného vyhľadávania sa ukladajú do URL; obľúbené a preferencie iba lokálne v prehliadači s označením DEMO.
**Dôvod:** Zdieľateľné výsledky, návrat späť bez straty filtrov; bez backendu (manifest bod 15, 17).
**Dopad:** Po prechode na backend sa obľúbené a preferencie presunú k účtu.

## 2026-11-22 — Schválenie obrazoviek Hľadať, mapa, Obľúbené, Profil a detail
**Rozhodnutie (Martin):** Po prezretí náhľadov v PR #2 schválil aktuálne obrazovky („je to v poriadku“).
**Dopad:** Pokračuje sa simulovaným hodnotením, návrhom miesta a náhľadom admin fronty (MVP_ROADMAP, Fáza 2, rezy 5–7).

## 2026-11-22 — Schválenie hodnotenia, návrhu miesta a admin fronty; spodné menu
**Rozhodnutie (Martin):** Hodnotenie, návrh miesta a náhľad admin fronty sú „v poriadku“. Spodné menu nesmie prekážať v zobrazení obsahu.
**Riešenie (Claude, UI detail):** Menu sa pri posúvaní nadol schová a vráti sa pri posune nahor, pri vrchu a na konci stránky aj pri fokuse klávesnicou. Na mape (bez posúvania) zostáva stále viditeľné. Rešpektuje „obmedziť pohyb“.
**Alternatívy:** Menšie menu natrvalo (stále zaberá miesto), menu iba na Domove (horšia orientácia).
**Dopad:** Viac priestoru na karty a detail; obsah má dolný odstup aj s bezpečnou zónou iPhonu.

## 2026-11-22 — Simulovaná registrácia a prihlásenie
**Rozhodnutie (Claude, v rámci PROTOTYPE_BRIEF bod 8–9 a manifestu bod 18):**
- `/registracia` a `/prihlasenie` fungujú iba v localStorage; heslo sa neukladá ani neoveruje, všetko je označené DEMO.
- V prototype registrácia **nie je vynútená** (dá sa „pokračovať bez účtu“), aby sa dali testovať všetky toky; v produkcii zostáva povinná.
- Po registrácii krátke uvítanie `/vitaj` „Ahoj [meno]“ s nepovinným výberom veku a tlačidlom do vyhľadávania (nič neblokuje). Domov potom oslovuje menom.
**Rozhodnutie (Martin, 2026-11-22):** „nemusí byť povinná v prototype a uvítanie stačí len po prihlásení“. Registrácia v prototype ostáva nepovinná. Uvítanie „Ahoj [meno]“ sa ukáže po registrácii aj po každom prihlásení, nie pri bežnom otvorení aplikácie (uzatvára otvorenú otázku 4 PROTOTYPE_BRIEF). Pôvodný návrh viesť po prihlásení rovno na Domov sa tým mení.
**Dopad:** Pri backende sa nahradí skutočnou autentifikáciou; obľúbené a preferencie sa presunú k účtu.
