# Test prototypu na iPhone — scenár pre rodičov (Fáza 3)

Stav: **pracovný návrh** (2026-11-22). Vychádza z `PROTOTYPE_BRIEF.md` (scenáre S1–S8) a `MVP_ROADMAP.md` (Fáza 3). Počet respondentov 3–5 je návrh.

## 1. Pred testom
- Odkaz na prototyp: _doplní sa po nasadení_ (pozri DECISIONS — spôsob zverejnenia čaká na rozhodnutie).
- Na iPhone otvorte odkaz v **Safari** → tlačidlo Zdieľať → **Pridať na plochu**. Ikona „Kutisko“ (dočasná) otvorí prototyp na celú obrazovku.
- Pred každým respondentom vymažte DEMO údaje: Nastavenia → Safari → Pokročilé → Údaje webových stránok → odstrániť pre doménu prototypu (alebo použite súkromné okno).
- Povedzte respondentovi: ide o **prototyp s vymyslenými miestami**, testujeme aplikáciu, nie jeho. Môže hovoriť nahlas, čo si myslí.
- **Súkromie:** nenahrávajte tváre ani deti, nezadávajte skutočné osobné údaje (pri registrácii stačí vymyslené meno a `rodic@example.com`). Ak nahrávate obrazovku, len so súhlasom.

## 2. Úlohy (bez nápovedy, v tomto poradí)
| # | Povedzte respondentovi | Úspech | Čo sledovať |
|---|---|---|---|
| S1 | „Hľadáte vnútornú herňu pre 3-ročné dieťa. Nájdite jednu, ktorá vás zaujme.“ | do 30 s bez pomoci | Použije kategóriu a vek, alebo píše do vyhľadávania? |
| S2 | „Chcete tam ísť autom. Spustite navigáciu.“ | otvorí Apple Mapy / Google Mapy / Waze alebo webovú verziu | Nájde tlačidlo „Navigovať“? Rozumie výberu aplikácie? |
| S3 | „Uložte si toto miesto, nájdite ho medzi obľúbenými a potom ho odstráňte.“ | bez chyby, s jasnou spätnou väzbou | Všimne si srdiečko a počet v spodnom menu? |
| S4 | „Ohodnoťte miesto, kde ste boli.“ | odošle hodnotenie 1–10 | Rozumie, že ide o DEMO zápis? Sú kritériá zrozumiteľné? |
| S5 | „Ste v Senci. Chcem vidieť, čo je najbližšie.“ | zmení lokalitu ručne | Nájde „Bratislava a okolie ▾“ na Domove? |
| S6 | „Vyhľadajte ‚trampolína pod vodou‘.“ | rozumie prázdnemu stavu a vráti sa späť | Použije „Zrušiť filtre“? |
| S7 | „Pri ktorom mieste nepoznáme cenu alebo hodiny? Ako to na vás pôsobí?“ | „neuvedené“ nepôsobí negatívne | Dôvera v ostatné údaje |
| S8 | „Navrhnite nové miesto, ale vyplňte len názov ‚a‘ a odošlite.“ | chybová hláška je konkrétna a prívetivá | Vie, čo opraviť? |

Voliteľne: registrácia a prihlásenie (uvítanie „Ahoj, [meno]!“), skrývanie spodného menu pri posúvaní.

## 3. Záverečné otázky (2–3 min)
1. Čo vás najviac potešilo / prekvapilo?
2. Čo bolo mätúce alebo pomalé?
3. Na škále 1–10: použili by ste takúto aplikáciu pri hľadaní miesta pre deti? Prečo?
4. Chýbala vám nejaká informácia o mieste?

## 4. Záznamový hárok (jeden na respondenta)
| Úloha | Splnené (áno / s pomocou / nie) | Čas | Poznámka (citát, kde sa zasekol) | Závažnosť* |
|---|---|---|---|---|
| S1 | | | | |
| S2 | | | | |
| S3 | | | | |
| S4 | | | | |
| S5 | | | | |
| S6 | | | | |
| S7 | | | | |
| S8 | | | | |

\*Závažnosť: **kritická** (úlohu nedokončí), **vysoká** (dokončí s veľkou námahou), **stredná**, **nízka** (kozmetika).

## 5. Po teste
- Zistenia zapíšeme ako GitHub Issues (štítok podľa závažnosti), kritické a vysoké opravíme pred Fázou 4.
- Výstupná brána Fázy 3: vlastník schváli UX, potvrdí dizajnové tokeny a návrh navigácie.

## 6. Interná kontrola pred testom (2026-11-22)
Scenáre S1–S8 prešli automatizovane v Chromiu s profilom iPhone 13 (bez povolenej polohy). Zistenie: S5 nemal na Domove ručný výber mesta a lokalita v Profile neovplyvňovala vzdialenosť — opravené (výber mesta na Domove, vzdialenosť a „Najbližšie“ sa počítajú od vybraného mesta). Safari/WebKit ani fyzický iPhone zatiaľ netestované.
