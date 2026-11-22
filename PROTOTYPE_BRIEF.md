# KUTISKO — Prototype Brief

Status: **návrh v0.1** (2026-11-22). Odvodené z `PRODUCT_MANIFESTO.md` v1.7 a `CLAUDE.md`.
Body označené **[NÁVRH]** nie sú schválené; rozhoduje vlastník produktu. Body označené **[SCHVÁLENÉ]** odkazujú na číslované rozhodnutie v manifeste.

## 1. Účel prototypu
Overiť s rodičmi, že KUTISKO dokáže rýchlo odpovedať na otázku *„Kam dnes s dieťaťom?“* — skôr, než sa investuje do backendu, dát a autentifikácie. [SCHVÁLENÉ 15]

Prototyp má overiť:
- zrozumiteľnosť obrazovky Domov (vyhľadávanie, filtre, mapa + zoznam),
- rýchlosť cesty od otvorenia po výber miesta a spustenie navigácie,
- dôveryhodnosť detailu miesta (overené vs. neoverené údaje, hodnotenia),
- vizuálny jazyk: prémiový, vzdušný, pre rodičov, s farebným smerom B použitým striedmo. [SCHVÁLENÉ 19, 20]

Prototyp **nemá** overovať: výkon backendu, škálovanie, reálnu moderáciu, platby.

## 2. Cieľová skupina
Rodičia detí približne 0–10 rokov v Bratislave a okolí, používajúci primárne iPhone/Android v prehliadači. Typická situácia: krátky čas, jedna ruka, dieťa vedľa, rozhodovanie „teraz“ alebo „cez víkend“. [SCHVÁLENÉ 11, 19]

## 3. Rozsah a poradie
Poradie je záväzné podľa manifestu (bod 24 a „Aktuálne poradie realizácie“):

**Fáza A — koncept Domov (prvý výstup)**
Jedna spustiteľná mobilná obrazovka Domov s DEMO dátami a funkčným základným vyhľadávaním. Predloží sa na schválenie vizuálneho jazyka (hierarchia, typografia, farby, karty, rozostupy, miera ilustrácií). Ďalšie obrazovky sa robia až po schválení.

**Fáza B — klikateľný prototyp** (po schválení Domov) [SCHVÁLENÉ 16]
1. Domov → filtrovanie → mapa/zoznam → detail → výber externej navigácie
2. Uložené (obľúbené)
3. Profil (s voliteľnými preferenciami)
4. Simulované hodnotenie
5. Simulovaný návrh nového miesta
6. Simulované pridanie fotografie
7. Náhľad administrátorskej fronty
8. Simulovaný tok registrácie/prihlásenia [SCHVÁLENÉ 18]
9. Krátka uvítacia obrazovka [NÁVRH — z mockupu „Ahoj [meno]“; zobrazovať len krátko a nebrániť vstupu do vyhľadávania]

## 4. Obrazovka Domov — obsah konceptu
Vychádza z mockupu (`kutisko mockup.pptx`, snímka „Dashboard“) a manifestu (bod 6, 25). Rozloženie nie je záväzné. [SCHVÁLENÉ 22]

Poradie prvkov zhora:
1. Hlavička: dočasný wordmark KUTISKO [SCHVÁLENÉ 23; logo zatiaľ bez zmeny], lokalita („Bratislava“, zmeniteľná ručne).
2. Vyhľadávanie: jedno pole „Hľadať kútik, herňu, ihrisko…“ (názov, mestská časť, typ).
3. Rýchle filtre (chips): kategória (Kútik / Herňa / Ihrisko), Vonku / Vnútri, Vek [NÁVRH], Otvorené teraz [NÁVRH — len ak sú hodiny známe].
4. Náhľad mapy s piny výsledkov; tlačidlo „Celá mapa“. Pred výberom providera statický/ilustračný náhľad. [NÁVRH]
5. Ovládanie zoradenia zoznamu („Najbližšie“, „Najlepšie hodnotené“, „Najnovšie“). [NÁVRH]
6. Zoznam kariet miest (fotografia, názov, kategória, vzdialenosť/mestská časť, hodnotenie rodičov + počet, vek, štítok overenia).
7. Spodná navigácia: Hľadať · Uložené · Profil (z mockupu „Menu“).

Funkčné minimum Fázy A:
- textové vyhľadávanie nad DEMO dátami (bez diakritiky aj s ňou, napr. „kutik“ = „kútik“),
- filtrovanie kategóriou, výsledky v mape aj zozname sú synchronizované,
- stavy: načítanie (skeleton), nulové výsledky s možnosťou zrušiť filtre, chyba načítania, zamietnutá poloha → manuálny výber mesta.

## 5. Kľúčové scenáre na test (iPhone)
Podľa „Brány medzi prototypom a backendom“ v manifeste:

| # | Scenár | Úspech |
|---|--------|--------|
| S1 | Nájdi vnútornú herňu vhodnú pre 3-ročné dieťa | do 30 s, bez nápovedy |
| S2 | Otvor detail a spusti navigáciu cez Waze/Google/Apple Maps | otvorí sa správna služba alebo webový fallback |
| S3 | Ulož miesto, nájdi ho v Uložených a odstráň | bez chyby, jasná spätná väzba |
| S4 | Ohodnoť miesto (1–10 + voliteľné kritériá) | rodič rozumie, že ide o DEMO zápis |
| S5 | Vyhľadávanie bez povolenej polohy | ponúkne ručný výber mesta |
| S6 | Filter bez výsledkov | zrozumiteľný prázdny stav a cesta späť |
| S7 | Miesto s neznámou cenou/hodinami | „neuvedené“ nepôsobí negatívne |
| S8 | Chybne vyplnený formulár návrhu miesta | konkrétna, prívetivá chybová hláška |

## 6. Dáta v prototype
- Výhradne **syntetické fixtures** v repozitári, jasne označené `DEMO` v UI aj v kóde. [SCHVÁLENÉ 17]
- Fiktívne názvy miest (nie skutočné prevádzky); súradnice len v rámci Bratislavy, bez tvrdenia, že na mieste niečo existuje.
- Žiadne vymyslené recenzie pripisované reálnym osobám, žiadne skutočné osobné údaje, žiadne fotografie detí.
- Fotografie miest: neutrálne placeholdery alebo licenčne čisté ilustračné obrázky bez osôb. [NÁVRH — zdroj fotografií nie je rozhodnutý]
- Každé miesto má pole `verification` (`overené` / `neoverené` / `návrh komunity`) a `source`, aby sa dal otestovať vizuál dôvery. [SCHVÁLENÉ 3, 5]

Návrh dátového modelu fixture (zjednodušený):
```ts
type Place = {
  id: string;
  name: string;                 // fiktívny
  category: 'kutik' | 'herna' | 'ihrisko';
  indoor: boolean;
  district: string;             // napr. „Petržalka“
  coords?: { lat: number; lng: number };
  address?: string;
  ageRange?: { min: number; max: number }; // [NÁVRH] kategórie veku nie sú schválené
  openingHours?: string;        // undefined = neuvedené, nie „zatvorené“
  price?: string;               // undefined = neuvedené, nie „zadarmo“
  amenities: string[];
  rating?: { overall: number; count: number }; // 1–10, oddelene od kritérií
  verification: 'verified' | 'unverified' | 'community';
  source: 'demo';
  photos: string[];
};
```

## 7. Simulácie a ich označenie
- Prihlásenie, hodnotenie, návrh miesta, upload fotografie a admin fronta fungujú len lokálne (pamäť/`localStorage`).
- Každý simulovaný zápis zobrazí jasné „DEMO — neuložené na server“. Nikdy „Publikované“. [SCHVÁLENÉ 17]
- Upload fotografie v prototype nič neodosiela; zobrazí len lokálny náhľad.

## 8. Navigácia na miesto
Podľa manifestu, sekcia „UX navigácia“ [SCHVÁLENÉ 14]:
- „Navigovať“ otvorí výber Apple Maps / Google Maps / Waze.
- Neoznačovať služby ako „nainštalované“.
- Cieľ = GPS súradnica; ak chýba, ponúknuť adresu alebo vysvetliť, že presná poloha nie je k dispozícii.
- Oficiálne URL schémy s webovým fallbackom, parametre bezpečne kódované.
- Bez prístupu k polohe používateľa.

## 9. Technické rámce prototypu
- Next.js (App Router) + TypeScript + Tailwind CSS. [podľa CLAUDE.md]
- PWA manifest a ikona; offline režim nie je cieľ.
- Bez backendu, databázy a reálnej autentifikácie. [SCHVÁLENÉ 15]
- Mapa: v Fáze A statický náhľad; interaktívna mapa až po výbere providera. [NÁVRH — pozri `DESIGN_SYSTEM_PROPOSAL.md` a `MVP_ROADMAP.md`]
- Náhľadové nasadenie: Vercel [NÁVRH — podľa kontextu projektu; nasadenie len po súhlase vlastníka].
- Kontroly pri každej iterácii: `lint`, `typecheck`, `build`, ručné overenie v mobilnom viewporte (390×844) a klávesnicou.

## 10. Akceptačné kritériá konceptu Domov [NÁVRH]
- Spustí sa lokálne jedným príkazom; build prejde bez chýb.
- Vyzerá dobre na 375–430 px; použiteľné aj na tablete/desktope (centrovaný stĺpec).
- Vyhľadávanie a filter kategórie fungujú; mapa a zoznam ukazujú rovnaké výsledky.
- Loading, empty a error stav sú vizuálne dotiahnuté.
- Kontrast textu spĺňa WCAG 2.1 AA, dotykové plochy min. 44×44 px, viditeľný focus.
- DEMO dáta sú zreteľne označené.

## 11. Grafické referencie
K 2026-11-22 sú v projektových súboroch (mimo verejného repozitára) dostupné: `app kutisko.ai`, `app kutisko.psd`, `kutisko mockup.pptx`, `vzor 1.png`, `vzor 2.png`, `hodnotenie.png`, `dieta01.png`, `dieta02.png`.
- `kutisko mockup.pptx`: štruktúra obrazoviek (úvod, dashboard, rozšírené vyhľadávanie, detail ako Booking, spodné menu, profil). Použitá ako obsahová referencia.
- `vzor 1.png`, `vzor 2.png`: náladové referencie cudzích dizajnov; nekopírovať.
- `hodnotenie.png`: koncept hodnotenia (rodičia 1–10 s kritériami; „appka“ 1–5). Pozri otvorenú otázku KUTISKO skóre.
- `dieta01.png`, `dieta02.png`: autorská ilustrácia dievčatka (s kockami a s loptou). Vlastník 2026-11-22 povolil nahratie do repozitára → `assets/illustrations/` (metadáta odstránené). Použitie výberovo, pozri `DESIGN_SYSTEM_PROPOSAL.md` sekcia 6.

## 12. Otvorené otázky pre vlastníka
1. Vekové kategórie filtra (napr. 0–2, 3–5, 6–10?) — [NÁVRH v DESIGN_SYSTEM_PROPOSAL / MVP_ROADMAP]
2. Kritériá podrobného hodnotenia (mockup uvádza čistotu, kreativitu priestoru, celkový dojem).
3. KUTISKO skóre 1–5: zobrazovať v prototype? Návrh: nie, kým nie je metodika.
4. Je uvítacia obrazovka „Ahoj [meno]“ žiadaná pri každom otvorení?
5. ~~Ilustrácia dievčatka~~ — povolená do repozitára (2026-11-22); návrh použitia: prázdne stavy a uvítanie.
