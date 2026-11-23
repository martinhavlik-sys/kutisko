# Changelog

## 2026-11-23 — Návrh backendu (len dokument)
**Zmenené**
- **docs/BACKEND_NAVRH.md:** návrh backendu na schválenie — architektúra (Supabase EÚ + Vercel + GitHub Actions), dátový model a návrh SQL, práva (RLS), prihlásenie, moderácia a admin, GDPR (poloha len v telefóne), import dát, migrácia z lokálnych dát, náklady a 5 etáp. Šesť otázok R1–R6 na rozhodnutie pre Martina.
- **DECISIONS.md:** záznam návrhu (stav: čaká na schválenie). **MVP_ROADMAP.md:** odkaz z Fázy 4.

**Otestované**
- Bez zmeny kódu. Názvy kľúčov localStorage, ID miest a cesty k modulom v dokumente overené voči aktuálnemu kódu. Návrh SQL nebol spustený (ilustračný).

**Známe obmedzenia**
- Ceny a limity služieb sú orientačné, pred založením účtov ich treba overiť v aktuálnych cenníkoch.

## 2026-11-23 — Ukážka: sponzorované miesta a akcie (nápad na neskôr)
**Zmenené** (nápad Martina, len vzorová ukážka, nič nerozhodnuté)
- **Domov:** nad zoznamom miest jedna karta **„Sponzorované“ · „Ukážka“** (vymyslená „Ukážková herňa“ / „Ukážkový kútik“). Ukáže sa len, keď zodpovedá zvolenej kategórii, veku a hľadaniu; nie je na mape ani v počte miest.
- **Domov:** pás **„Akcie v najbližších dňoch“** pod mapou s vymyslenými akciami na najbližších 14 dní, každá so štítkom „Ukážka“; tlačidlo „Skryť ukážku“.
- **Nová stránka „Pre prevádzky“** (`/pre-prevadzky`): čo uvidia rodičia, návrh zásad, zoznam akcií a ukážkový formulár „Pridať akciu“ (uloží sa len v prehliadači, akciu možno odstrániť).
- **Profil:** jeden prepínač „Ukážka: sponzorované miesta a akcie“ (predvolene zapnuté). Pre všetkých sa vypne jedným riadkom (`PROMO_DEMO_DEFAULT_ON`).
- **docs/MONETIZACIA.md:** návrh zásad, aby reklama nezavádzala, a otázky na cenník a pravidlá pre Martina.

**Otestované**
- `npm test` (53; nové: dnešok v Bratislave, okno 14 dní a poradie akcií, ukážkové akcie patria len vymysleným prevádzkam, najviac 1 sponzorované a len pri zhode s filtrami, kontrola formulára), `lint`, `typecheck`, `build`.
- Playwright (iPhone 13, Chromium): pás akcií a sponzorovaná karta na Domove; filter Ihriská → bez reklamy aj akcií; formulár (chyby pri prázdnych poliach, pridanie akcie → objaví sa na Domove so štítkom „Pridali ste vy“); „Skryť ukážku“ → zmizne všetko a prepínač v Profile je vypnutý, opätovné zapnutie; šírka 320 px bez vodorovného posúvania. V konzole len nenačítané mapové podklady (sieť sandboxu).

**Známe obmedzenia**
- Iba ukážka v prehliadači: žiadne platby, účty prevádzok ani schvaľovanie akcií. Sponzorované miesto a akcie vedú na stránku „Pre prevádzky“, nie na skutočný detail. Zatiaľ len na Domove (nie v Hľadať). Netestované na fyzickom iPhone.

## 2026-11-23 — Doplnky detailu: otvorené teraz, akcie, tipy, oslavy
**Zmenené** (Martin schválil všetkých 5 návrhov)
- **Otvorené teraz:** pod názvom a v hodinách stav „Otvorené · zatvára o 20:00“, „Čoskoro zatvára“ (posledná hodina) alebo „Zatvorené · otvára zajtra o 9:00“; v tabuľke hodín je zvýraznený dnešný riadok, rovnaký stav je v spodnej lište. Počíta sa podľa času v Bratislave. Pri nejasných alebo sezónnych hodinách sa stav nezobrazí (radšej nič ako nesprávne „Otvorené“).
- **Rýchle akcie** pod názvom: Trasa, Zavolať, Web, Zdieľať. Zdieľať otvorí systémový panel iPhonu (Správy, WhatsApp…), inde skopíruje odkaz.
- **Telefóny** 5 prevádzok (MINI CITY, Simba Centrum, RETRO KIDS, Inspiro, Adventica) z ich webov, so zdrojom a dátumom overenia. Kde telefón overený nemáme, tlačidlo Zavolať sa neukáže.
- **Tipy od rodičov:** krátke praktické rady (10–160 znakov), DEMO v prehliadači, prázdny stav s príkladmi.
- **Narodeninové oslavy** (len herne a kútiky): ak web prevádzky oslavy uvádza, povieme to a ponúkneme číslo na oslavy (Simba a Inspiro majú samostatné) a web. Ceny ani balíčky nevymýšľame; pri ostatných „Zatiaľ nevieme“.

**Otestované**
- `npm test` (47; nové: popisy dní z webov, otvorené/čoskoro/zatvorené, rôzne dni, nejasné zápisy, OSM zápisy, čas v Bratislave), `lint`, `typecheck`, `build`.
- Playwright (iPhone 13) s pevným časom: Simba po 15:30 → otvorené, tel. odkaz, kopírovanie odkazu, tip (chyba pri krátkom texte, pridanie), číslo na oslavy; JumpFun bez telefónu; MINI CITY večer → „otvára zajtra o 9:00“; OSM ihrisko len Trasa + Zdieľať a bez oslav; šírka 320 px. Bez chýb v konzole.

**Známe obmedzenia**
- Sviatky a školské prázdniny nepoznáme; stav sa riadi bežným týždňom (upozornenie pri hodinách ostáva). Telefóny JumpFun (Nivy, Kids House) a kútikov v OC zatiaľ chýbajú (web sa nedal načítať / neuvádza). Netestované na fyzickom iPhone.

## 2026-11-23 — Galéria fotiek v detaile miesta
**Zmenené**
- **Hlavný obrázok ako posuvník:** keď má miesto schválené fotky, potiahnutím prsta sa listuje, dole sú bodky a počítadlo „1 / 4“; na počítači šípky. Ťuknutie otvorí fotku na celú obrazovku.
- **Celá obrazovka:** čierne pozadie, listovanie prstom alebo šípkami na klávesnici, počítadlo, zavretie krížikom alebo klávesom Esc, pod fotkou kto ju pridal.
- **Nová sekcia „Fotky“** (hneď pod rýchlymi údajmi): pás náhľadov s dlaždicou „Pridať fotku“. Bez fotiek pekný prázdny stav s ilustráciou dievčatka a výzvou „Pridať prvú fotku“; v hlavnom obrázku ostáva ilustrácia a tlačidlo „Pridať fotku“.
- **Pridať fotku:** krátke okno s pravidlami (fotiť priestor, nie deti; kontrola pred zverejnením; odstránenie polohy z fotky), povinný súhlas. Fotka čaká na schválenie a vidí ju len autor (štítok „Čaká na schválenie“). Najviac 5 čakajúcich fotiek na miesto.
- **Admin fronta:** v karte Fotky pribudli fotky z galérie miesta („Galéria miesta“); po schválení sa objavia v hlavnom obrázku aj v galérii.
- Zdroj fotiek je na jednom mieste (`src/lib/gallery.ts`), pripravený na neskoršie úložisko.

**Otestované**
- `npm test` (41; nové: len schválené fotky sú verejné, cudzie čakajúce nevidno, poradie, limit, skloňovanie), `lint`, `typecheck`, `build` prešli.
- Playwright (iPhone 13, Chromium) so syntetickými testovacími obrázkami: prázdny stav, pridanie fotky (chyba bez fotky, chyba bez súhlasu, odoslanie), štítok čakania, schválenie v admin fronte, posuvník 1 → 2 / 4, celá obrazovka (otvorenie na 2. fotke, šípka → 3 / 4, Esc zavrie), šírka 320 px, počítač 1280 px, detail OSM ihriska. Bez chýb v konzole.

**Známe obmedzenia**
- Fotky sú zatiaľ iba DEMO v tomto prehliadači (zmenšené na 640 px); skutočné úložisko fotiek nie je rozhodnuté. Netestované na fyzickom iPhone.

## 2026-11-23 — Výraznejšia poloha na Domove
**Zmenené**
- Na Domove majú „Bratislava a okolie“ (resp. vybrané mesto alebo „Moja poloha“) a „Použiť moju polohu“ jemné farebné podfarbenie (svetlo ružová a svetlo tyrkysová pilulka s tenkým okrajom), aby boli výraznejšie (požiadavka Martina). Na úzkych displejoch (pod 360 px) sa text skráti na „Použiť polohu“.

**Otestované**
- `lint`, `build`; Playwright (iPhone 13 bez polohy aj s polohou, šírka 320 px).

## 2026-11-23 — Moja poloha a okruh v km
**Zmenené**
- Nový panel „Kde hľadáte?“ (Domov, Hľadať): **Použiť moju polohu** s vysvetlením, ručný výber mesta a **okruh** Bez obmedzenia / 1 / 3 / 5 / 10 / 25 km.
- S polohou: karty ukazujú „X km od vás“, výsledky sa zoradia od najbližšieho, na mape je modrá bodka a tlačidlo „Ukázať moju polohu“.
- Pri zamietnutí polohy panel vysvetlí, ako ju na iPhone zapnúť, a počíta od mesta (predvolene centrum Bratislavy). Mimo Bratislavy a okolia (nad 60 km) sa poloha nepoužije.
- Hľadať: prvý rýchly filter „Moja poloha · do X km“, v Filtroch nová sekcia Vzdialenosť. Prázdny stav pri malom okruhu navrhne väčší okruh.
- Profil: zapnutie/vypnutie polohy; „Okruh vyhľadávania“ teraz naozaj filtruje výsledky.
- Súkromie: poloha je iba v pamäti zariadenia, neukladá sa ani neodosiela.

**Otestované**
- `npm test` (36; nové: poloha v/mimo pilotu, záloha na mesto, okruh vylučuje vzdialenejšie miesta), `lint`, `typecheck`, `build` prešli.
- Playwright (iPhone 13, Chromium) so simulovanou polohou v Petržalke: povolenie → „Moja poloha“, zoradenie od najbližšieho; okruh 1 km = 34 miest; po obnovení stránky sa poloha zistí sama; modrá bodka na mape; zamietnutá poloha → návod a záloha; poloha v Košiciach → záloha na mesto; šírka 320 px. Bez chýb v konzole.

**Známe obmedzenia**
- Netestované na fyzickom iPhone (Safari/PWA). Safari v PWA z plochy sa môže na polohu pýtať pri každom spustení, to riadi iOS.
- Vzdialenosť je vzdušnou čiarou, nie po ceste. Ilustračná záloha mapy (keď sa nenačítajú podklady) je hrubá.

## 2026-11-23 — Presná poloha herní a kútikov
**Zmenené**
- Nová GitHub Action „Poloha herní a kútikov (OSM)“ (schválil Martin) spúšťa `scripts/curated/geocode.mjs` a commitne `src/data/curated/geo.json`. Všetkých 11 herní a kútikov má presnú polohu z OpenStreetMap (adresný bod alebo budova OC), každá do 2 km od pôvodného odhadu. Detail ukazuje GPS s atribúciou OSM a navigácia ide na presné súradnice.
- Kontrolná vzdialenosť od odhadu zvýšená na 4 km (odhady v okrajových častiach boli menej presné).

**Otestované**
- Akcia prebehla úspešne (11/11). `npm test` (32), `lint`, `typecheck` prešli. Zhody adries som skontroloval podľa výpisu Nominatimu (ulica, číslo, mestská časť).

**Známe obmedzenia**
- Pri OC je bod na budove centra, nie pri samotnom kútiku.

## 2026-11-23 — Čitateľné názvy ihrísk bez vlastného mena
**Zmenené**
- Z 975 ihrísk z OpenStreetMap má vlastný názov len 113. Ostatným teraz dávame zrozumiteľný názov odvodený z OSM dát namiesto opakovaného „Detské ihrisko“:
  - **758 podľa najbližšej ulice** (do 300 m), napr. „Ihrisko, Romanova“. Pri viacerých rovnakých sa pridá druhá ulica: „Ihrisko, Studená / Krajná“.
  - **50 podľa parku**, napr. „Ihrisko v parku Andreja Hlinku“ alebo „Ihrisko, Sad Janka Kráľa“ (ihrisko aj do 30 m od okraja parku).
  - **12 podľa štvrte/lokality** (place=neighbourhood…, do 800 m), keď v okolí nie je pomenovaná ulica.
  - **42 podľa mestskej časti alebo obce** ako posledná záloha, napr. „Ihrisko, Karlova Ves“.
- Ihriská s vlastným názvom v OSM sa nemenia. Nové pole `nameSource` (`osm`/`park`/`street`/`place`/`area`) označuje pôvod názvu.
- Import z OSM sťahuje aj pomenované ulice (do 300 m od ihrísk) a štvrte; ulice aj štvrte sú nepovinné (bez nich import prejde). Pridaný záložný Overpass server a varovania behu ako anotácie.
- Detail → „Pôvod údajov“: doplnené, že názov bez vlastného mena je odvodený od parku, ulice, štvrte alebo mestskej časti. Licencia zdroja (© prispievatelia OpenStreetMap, ODbL) ostáva uvedená.

**Otestované**
- `npm test` (34; nové: názov podľa ulice/parku/štvrte/mestskej časti, vzdialenosť k ulici, rozlíšenie rovnakých názvov druhou ulicou, vynechanie mostov), `lint`, `typecheck`, `build` prešli.
- GitHub Action „Import ihrísk (OSM)“ prebehla úspešne, dáta commitnuté do vetvy.
- Playwright (iPhone 13): Domov, Hľadať (zoznam s novými názvami), detail ihriska — bez chýb v konzole (mapové dlaždice sú z cloudu blokované, to je očakávané).

**Známe obmedzenia**
- Odvodený názov je orientačný: ukazuje najbližšiu ulicu/park, nie nutne oficiálny názov ihriska. 42 ihrísk ostáva len s názvom mestskej časti (napr. odľahlé obce bez pomenovaných ulíc v OSM).
- Rovnaké názvy, ktoré sa nedajú rozlíšiť druhou ulicou, ostávajú — odlíši ich poloha na mape a mestská časť.

## 2026-11-22 — Skutočné herne a kútiky namiesto DEMO
**Zmenené**
- 7 vymyslených DEMO kútikov a herní nahradilo **11 skutočných miest** v Bratislave a Ivanke pri Dunaji (MINI CITY, Simba Centrum, Jump Fun Nivy, Jump Fun KidsHouse, RETRO Kids, INSPIRO Park oddychu, Adventica Eurovea, ihrisko v Eurovei, kútik Aupark, BUPPI v Bory Mall, AVION Junior). Údaje sú ručne overené na weboch prevádzok a obchodných centier k 22. 11. 2026 (`src/data/curated/indoor-places.json`). Popisy sú vlastné, bez fotiek, bez údajov z Google, bez hodnotení.
- Karta: „Skutočné miesto · overené na webe prevádzky 22. 11. 2026“ a dnešné hodiny, ak sú rovnaké celý týždeň. Detail: adresa, týždenné hodiny, poznámka k cene, tlačidlo „Web prevádzky“, odkazy na zdroje. Neuvedené údaje ostávajú sivo „neuvedené“.
- Nový typ ceny „Vstup pri konzumácii“ (INSPIRO); ceny s desatinnou čiarkou.
- Navigácia: pri približnej polohe vedie na adresu prevádzky. Upozornenie „DEMO: súradnice sú ilustračné“ sa už ukazuje len pri DEMO miestach (predtým aj pri skutočných ihriskách).
- Vymyslené DEMO popisy a recenzie odstránené z aplikácie; DEMO miesta ostali len ako testovacie dáta (`src/data/demoFixtures.ts`).
- `docs/HERNE_KUTIKY.md`: pravidlá zberu, prehľad 11 miest a kandidáti na overenie (nezobrazení).
- `scripts/curated/geocode.mjs`: presná poloha z OpenStreetMap (Nominatim) s kontrolou vzdialenosti od odhadu.

**Otestované**
- `npm test` (32; nové: herne a kútiky majú zdroj a dátum, žiadne hodnotenia ani Google; navigácia na adresu), `lint`, `typecheck`, `build` prešli.
- Playwright (iPhone 13): Domov, detail RETRO Kids a Aupark (chýbajúce údaje), Hľadať herne; bez chýb v konzole.

**Známe obmedzenia**
- Poloha herní je zatiaľ **približná** (prostredie Claude nemá prístup na Nominatim ani Overpass). Presnú polohu z OSM doplní spustenie `node scripts/curated/geocode.mjs`. Pri Aupark a Eurovea je poloha z Wikipédie, pri Bory Mall z ihriska Bupi v OSM.
- Ceny a hodiny sa menia, treba ich pravidelne overovať. Aupark a AVION Junior nemajú na webe hodiny, viaceré miesta nemajú cenu.
- Miesta nemajú fotky (fotky až s úložiskom).

## 2026-11-22 — Skutočné ihriská prvé v „Odporúčané“, mestské ihriská čakajú na licenciu
**Zmenené**
- Zoradenie „Odporúčané“ dáva skutočné ihriská pred DEMO kútiky a herne.
- Porovnanie s mestom ukladá licenčné metadáta vrstvy, kandidátov `src/data/osm/city-playgrounds.json` a zoznam `docs/MESTSKE_IHRISKA.md` (113 verejných v prevádzke chýbajúcich v OSM, 158 vyradených).
- Aplikácia vie zobraziť mestské ihriská (štítok „register mesta, neoverené“, zdroj v detaile), ale sú vypnuté, kým sa neoverí licencia (`src/data/sources.ts`).

**Otestované**
- `npm test` (29), `lint`, `typecheck`, `build`; GitHub Action prebehla úspešne.

**Známe obmedzenia**
- Vrstva mesta nemá v metadátach licenciu, preto sa 113 ihrísk zatiaľ nezobrazuje.

## 2026-11-22 — Skutočné ihriská z OpenStreetMap
**Zmenené**
- Do aplikácie pribudlo **975 skutočných verejných ihrísk** Bratislavy a okolia z OpenStreetMap (z 1 197 objektov `leisure=playground` po vyradení súkromných, nepoužívaných a duplicít bod/plocha). Mestská časť alebo obec sa priraďuje z hraníc OSM (Petržalka 135, Ružinov 126, Nové Mesto 81, Karlova Ves 66, …; 80 obcí okolia).
- Vymyslené DEMO ihriská (4) odstránené; DEMO kútiky a herne (7) ostávajú so štítkom DEMO.
- Karta ihriska: bez štítku DEMO, „Vek neuvedený“ sivo, hlavné vybavenie ako štítky, riadok „Skutočné miesto · údaje z OpenStreetMap“. Detail: vecný opis z dostupných údajov, povrch, otváracie hodiny z OSM (ak sú), odkaz na objekt v OSM, pôvod údajov s licenciou ODbL. Žiadne vymyslené hodnotenia pre skutočné miesta.
- Filter veku miesta s neuvedeným vekom nevylučuje; vyhľadávanie hľadá aj vo vybavení (napr. „pieskovisko“).
- Mapa: piny sa zhlukujú do kruhov s počtom (ťuk priblíži), farba pinu podľa kategórie; zoznamy na Domove a v Hľadaní sa načítavajú po 20 („Zobraziť ďalšie“).
- Import: `scripts/osm/import-playgrounds.mjs` + GitHub Action „Import ihrísk (OSM)“; porovnanie s dátami mesta `scripts/osm/city-crosscheck.mjs`.

**Otestované**
- `npm test` (28 vrátane 6 testov transformácie OSM a 3 testov zhlukovania), `lint`, `typecheck`, `build` prešli.
- GitHub Action prebehla 4× úspešne (Overpass občas vráti 502/504, skript opakuje).
- Playwright (iPhone 13, podstrčený štýl mapy): Domov, filter Ihriská (975 miest), „Zobraziť ďalšie“, Celá mapa so zhlukmi a priblížením, ťuk na pin, detail OSM ihriska; bez chýb v konzole.

**Známe obmedzenia**
- Iba 113 z 975 ihrísk má v OSM vlastný názov; ostatné sú „Ihrisko v parku …“ alebo „Detské ihrisko“ (rozlíši ich mestská časť a vzdialenosť).
- Vybavenie je zapísané pri 413 ihriskách, vek pri 71, otváracie hodiny pri 60, povrch pri 76. Fotky ani adresy z OSM nie sú.
- Zoradenie „Odporúčané“ dáva DEMO kútiky a herne s vymysleným hodnotením pred skutočné ihriská (ihriská bez hodnotení majú neutrálnu hodnotu).
- Porovnanie s registrom športovísk mesta: 710 detských ihrísk, 439 sa zhoduje s OSM, 121 verejných chýba v OSM. Mestské dáta sa v aplikácii zatiaľ nezobrazujú (pozri DECISIONS.md).

## 2026-11-22 — Skutočná mapa aj v náhľade na Domove
**Zmenené**
- Náhľad mapy na Domove je skutočná mapa MapLibre s rovnakými podkladmi ako Celá mapa (spätná väzba Martina z iPhonu: na Domove bola len ilustrácia).
- Náhľad sa nedá posúvať ani zoomovať, aby nezachytával posúvanie stránky; ťuk na pin zvýrazní kartu miesta, ťuk inde alebo „Celá mapa“ otvorí plnú mapu.
- Mapa sa načíta až keď je blízko obrazovky. Ak sa podklady nenačítajú (chyba alebo 8 s), zobrazí sa pôvodná ilustračná mapa s označením „podklady nedostupné“.

**Otestované**
- `npm test` (18), `lint`, `typecheck`, `build` prešli.
- Playwright (iPhone 13) s podstrčeným štýlom mapy: 11 pinov, posúvanie stránky cez mapu funguje, ťuk na pin zvýrazní kartu, ťuk na pozadie otvorí `/hladat?zobrazenie=mapa`; pri blokovaných podkladoch sa ukáže ilustračná záloha. Bez chýb v konzole.

**Známe obmedzenia**
- Skutočné podklady OpenFreeMap sa v zostavovacom prostredí nedajú načítať; overiť na iPhone.

## 2026-11-22 — Prototyp nasadený na Vercel
**Zmenené**
- Verejná adresa prototypu https://kutisko.vercel.app/ doplnená do README a `docs/TEST_IPHONE.md`.

**Otestované**
- Domov, `/hladat?zobrazenie=mapa` a manifest odpovedajú HTTP 200, bez prihlasovacej brány, `noindex` ostáva.

**Známe obmedzenia**
- Vzhľad a mapové podklady na nasadenej verzii zatiaľ neoverené (zo zostavovacieho prostredia nedostupné); overí sa na iPhone.

## 2026-11-22 — Príprava testu na iPhone (Fáza 3)
**Zmenené**
- Ručný výber mesta (scenár S5): na Domove je lokalita „Bratislava a okolie ▾“ tlačidlom, ktoré otvorí výber mesta (Bratislava, Senec, Stupava, Šamorín, Pezinok, Malacky). Vzdialenosti na kartách a v detaile aj zoradenie „Najbližšie“ sa počítajú od vybraného mesta; výber sa zdieľa s Profilom. Polohu prototyp nezisťuje.
- PWA: manifest, dočasná ikona „k“ (logo nie je finálne), `apple-touch-icon` a režim na celú obrazovku po „Pridať na plochu“ v Safari.
- `docs/TEST_IPHONE.md`: scenár testu s rodičmi (S1–S8), záverečné otázky, záznamový hárok, zásady súkromia.

**Otestované**
- `npm test` (18 testov vrátane výberu mesta a zoradenia od neho), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13, bez povolenej polohy): S1 vnútorná herňa pre 3–5 r. (3 výsledky), S2 navigačné odkazy Apple/Google/Waze, S3 uloženie a odstránenie so spätnou väzbou, S5 výber Senca → „19,0 km od Senca“, S6 prázdny stav s cestou späť, S7 texty „neuvedené“; manifest a apple-touch-icon sa servírujú. Bez chýb v konzole.

**Známe obmedzenia**
- Safari/WebKit ani fyzický iPhone zatiaľ netestované; verejný odkaz na test čaká na rozhodnutie o nasadení.
- Maximálna vzdialenosť z Profilu zatiaľ výsledky nefiltruje.

## 2026-11-22 — Uvítanie aj po prihlásení (rozhodnutie Martina)
**Zmenené**
- Po prihlásení sa ukáže krátke uvítanie „Ahoj, [meno]!“ s textom „Vitajte späť…“; po registrácii zostáva text „Účet je pripravený…“. Pri bežnom otvorení aplikácie sa uvítanie neukazuje.
- Registrácia v prototype ostáva nepovinná (zapísané v DECISIONS).

**Otestované**
- `npm test`, `typecheck`, `lint`, `build` prešli. Playwright (iPhone 13): registrácia → `/vitaj?novy=1`, prihlásenie → `/vitaj` s „Vitajte späť“, Domov bez uvítania.

## 2026-11-22 — Spodné menu neprekáža, simulovaná registrácia, prihlásenie a uvítanie
**Zmenené**
- Spodné menu sa pri posúvaní nadol schová a vráti sa pri posune nahor, pri vrchu a na konci stránky (aj pri fokuse klávesnicou). Na mape ostáva viditeľné. Pri „obmedziť pohyb“ bez animácie.
- `/registracia`: meno (oslovenie), e-mail, heslo (aspoň 8 znakov, zobraziť/skryť), potvrdenie, že ide o DEMO účet. Konkrétne chybové hlášky a fokus na prvé chybné pole.
- `/prihlasenie`: e-mail a heslo; neznámy e-mail ukáže vysvetlenie a odkaz na registráciu. Heslo sa neukladá ani neoveruje.
- `/vitaj`: krátke uvítanie „Ahoj, [meno]!“ so Simonkinou ilustráciou, nepovinný výber veku dieťaťa a „Začať hľadať“ (s vekom otvorí vyhľadávanie s filtrom). „Preskočiť“ vedie na Domov.
- Domov: oslovenie „Ahoj, [meno]!“ a iniciály v hlavičke; bez účtu tlačidlo „Prihlásiť sa“.
- Profil: karta účtu (meno, e-mail, DEMO) alebo výzva vytvoriť účet / prihlásiť sa; funkčné odhlásenie.

**Otestované**
- `npm test` (16 testov vrátane validácie registrácie a prihlásenia), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13): menu sa skryje po posune nadol, vráti sa po posune nahor aj na konci stránky; na mape zostáva; prázdna registrácia → 4 chyby a fokus na meno; registrácia → uvítanie „Ahoj, Jana!“ → výber veku → `/hladat?vek=3-5`; Domov s oslovením; odhlásenie v Profile; prihlásenie neznámeho e-mailu → hláška, známeho (iné veľké písmená) → Domov; bez vodorovného pretečenia, bez chýb v konzole.

**Známe obmedzenia**
- Účet existuje iba v tomto prehliadači; žiadna skutočná autentifikácia ani overenie hesla.
- Registrácia sa v prototype nevynucuje (v produkcii bude povinná).

## 2026-11-22 — Simulované hodnotenie, návrh miesta, nahlásenie a náhľad admin fronty
**Zmenené**
- Martin schválil náhľady obrazoviek z PR #2 (zapísané v DECISIONS).
- `/miesto/[id]/hodnotit`: celkový dojem 1–10 (povinný), voliteľné kritériá čistota a kreativita priestoru, text do 1000 znakov, voliteľná fotka. Jedno hodnotenie na miesto, dá sa upraviť; v detaile sa zobrazí „Vaše hodnotenie (DEMO)“.
- `/navrhnut`: návrh nového miesta (názov, typ, adresa/časť, vek, popis, fotka) s konkrétnymi chybovými hláškami a fokusom na prvé chybné pole.
- Fotky: náhľad sa zmenší a znovu zakóduje v prehliadači (odstráni EXIF/GPS), vyžaduje potvrdenie, že na fotke nie sú rozpoznateľné deti, a čaká na schválenie.
- Detail: „Nahlásiť nesprávny údaj“ (dôvod + poznámka).
- `/admin` (náhľad, DEMO, bez oprávnení): záložky Návrhy, Fotky, Nahlásenia, Recenzie; schváliť / zamietnuť / vrátiť, skryť recenziu bez zmeny hodnotenia, záznam zásahov, vymazanie DEMO zápisov. Obsahuje 2 ukážkové návrhy a 1 ukážkové nahlásenie.
- Profil: počet mojich hodnotení, odkazy na návrh miesta a admin frontu.

**Otestované**
- `npm test` (13 testov vrátane validácie formulárov), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13): odoslanie prázdneho hodnotenia → chybová hláška a fokus na stupnicu; fotka bez potvrdenia → chyba; úspešné odoslanie → potvrdenie a moje hodnotenie v detaile; nahlásenie bez dôvodu → chyba, s dôvodom → uložené; návrh s chybami (4 polia) → konkrétne hlášky, opravený návrh → potvrdenie; admin: 3 návrhy, schválenie návrhu a fotky, 2 nahlásenia, skrytie recenzie, záznam 3 zásahov; stav fotky sa prejaví v detaile; bez chýb v konzole.

**Známe obmedzenia**
- Všetko je iba v localStorage tohto prehliadača; žiadne skutočné zverejnenie ani oprávnenia.
- Ukážkové recenzie z dát sa v admin fronte nemoderujú, iba vlastné DEMO hodnotenia.
- Moje DEMO hodnotenie zatiaľ nemení zobrazené priemerné skóre miesta.

## 2026-11-22 — Rozšírené vyhľadávanie s mapou, Obľúbené a Profil (prototyp)
**Zmenené**
- `/hladat`: vyhľadávanie s rýchlymi filtrami (kategória, vnútri/vonku, zadarmo), panel Filtre (kategória, vek, prostredie, vybavenie, iba overené, iba zadarmo) s počtom výsledkov pred potvrdením, zoradenie, prepínač Zoznam / Mapa. Filtre sú v URL (dajú sa zdieľať, prežijú obnovenie).
- Interaktívna mapa na **MapLibre GL** s podkladmi OpenFreeMap (bez kľúča a poplatkov); piny sú synchronizované s filtrami, ťuk na pin ukáže náhľad miesta s odkazom na detail. Ak sa podklady nenačítajú, mapa zostane použiteľná na neutrálnom pozadí s upozornením.
- Tlačidlo „Celá mapa“ na Domove otvorí mapu s rovnakými filtrami.
- `/ulozene`: obľúbené miesta (localStorage), prázdny stav so Simonkinou ilustráciou a cestou „Objaviť miesta“.
- `/profil`: simulovaný účet, voliteľné preferencie (vek dieťaťa, ručný výber lokality, maximálna vzdialenosť) s možnosťou zmeniť alebo vymazať; vyhľadávanie ponúkne „Použiť vek z profilu“.
- Spodná navigácia je spoločná pre všetky obrazovky a zvýrazňuje aktuálnu stránku.
- Miesta majú údaj vnútri/vonku v základných dátach; nový skript kopíruje web worker MapLibre do `public/vendor/` (spúšťa sa pred `dev` a `build`).

**Otestované**
- `npm test` (11 testov vrátane nových filtrov), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13, desktop): Domov → Ihriská → Celá mapa (4 piny), ťuk na pin → náhľad, prepnutie na zoznam (4 karty), panel Filtre s vybavením „kaviareň“ (4 miesta), vyhľadávanie „ruzinov“ (1), uloženie a odstránenie v Obľúbených, uloženie a vymazanie preferencií v localStorage, bez horizontálneho scrollu na 390 px.

**Známe obmedzenia**
- V testovacom prostredí boli mapové podklady blokované sieťou, preto screenshoty ukazujú mapu bez podkladov (overený záložný stav). Vzhľad s podkladmi OpenFreeMap treba skontrolovať lokálne alebo na iPhone.
- Preferencia lokality a vzdialenosti sa zatiaľ len ukladá, výsledky ešte neovplyvňuje.
- Hodnotenie, návrh miesta a zmena hesla ukážu iba „pripravujeme“.

## 2026-11-22 — Vekové skupiny podľa schválenia
- Filter veku používa schválené skupiny 0–2, 3–5, 6–10, 10+ (predtým pracovné 0–3, 3–6, 6–10, 10+); hranice sa započítavajú vrátane.
- Otestované: `npm test` (rozšírený test hraničného veku), `typecheck`, `lint`, `build`.

## 2026-11-22 — Detail miesta a výber navigácie (prototyp)
**Zmenené**
- Martin schválil vizuálny smer obrazovky Domov v1 (pozri DECISIONS).
- Nová stránka `/miesto/[id]` (staticky generovaná pre 11 DEMO miest): ilustračný náhľad, kategória a vnútri/vonku, skóre 1–10 so slovným vyjadrením a počtom hodnotení, stav overenia, rýchle fakty (vek, cena, dnešné hodiny, prostredie), popis, vybavenie, čiastkové hodnotenie (čistota, kreativita priestoru, celkový dojem podľa `hodnotenie.png`), ukážkové recenzie, týždenné hodiny, poloha na ilustračnej mape, pôvod údajov, ďalšie miesta v okolí.
- Spodná lišta s cenou a tlačidlom **Navigovať** → výber Apple Mapy / Google Mapy / Waze (oficiálne univerzálne URL s webovým fallbackom, bez zisťovania polohy, s DEMO upozornením).
- Obľúbené sa ukladajú lokálne (localStorage) a sú spoločné pre Domov aj detail; Domov si pri návrate zo detailu zachová filtre (React Activity v Next.js 16).
- Stránka „Miesto nenájdené“, skeleton pri načítaní detailu.

**Otestované**
- `npm test` (10 testov vrátane URL navigácie), `typecheck`, `lint`, `build` prešli.
- Playwright (iPhone 13, desktop): Domov → filter Herne → karta → detail; uloženie srdiečkom sa prejaví v počítadle na Domove; dialóg navigácie má správne URL pre všetky tri služby a zatvorí sa klávesom Esc; Späť vráti na Domov so zachovaným filtrom; miesto bez hodnotení a neznámych údajov; neexistujúce miesto; bez chýb v konzole.

**Známe obmedzenia**
- Neexistujúce miesto zobrazí stránku „nenájdené“, ale HTTP kód je 200 (streamovanie s Cache Components).
- Hodnotenie, nahlásenie chyby a celá mapa zatiaľ zobrazia iba „pripravujeme“.
- Otvorenie aplikácií Apple Mapy/Waze netestované na fyzickom iPhone.

## 2026-11-22 — Koncept obrazovky Domov v1 (prototyp)
**Zmenené**
- Založený projekt Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, bez ďalších runtime závislostí.
- Obrazovka Domov: hlavička s dočasným wordmarkom, pozdrav „Kam ideme dnes?“, vyhľadávanie, filtre kategórií (Všetko / Kútiky / Herne / Ihriská) a veku (0–3, 3–6, 6–10, 10+), ilustračný náhľad mapy s pinmi synchronizovanými s filtrami, zoradenie (Odporúčané / Najbližšie / Najlepšie hodnotené), karty miest, spodná navigácia Domov · Hľadať · Obľúbené · Profil.
- 11 syntetických miest označených DEMO (Bratislava a okolie), skóre 1–10, rozlíšenie overených a neoverených údajov, neznáme ceny a hodiny sa zobrazujú ako „neoverené“, nie ako negatívne.
- Stavy: načítanie (skeleton), prázdny výsledok (so Simonkinou ilustráciou), chyba s „Skúsiť znova“. Na testovanie `?stav=nacitanie` a `?stav=chyba`.
- Pracovné dizajnové tokeny (farebný smer B s tmavšími variantmi pre text, zjednotené s DESIGN_SYSTEM_PROPOSAL v PR #1) v `src/app/globals.css`, písmo Plus Jakarta Sans.
- Simonkine ilustrácie `public/illustrations/` (so súhlasom vlastníka).

**Otestované**
- `npm test` (7 testov: filtre, vyhľadávanie bez diakritiky, zoradenie, formátovanie, DEMO označenie), `npm run typecheck`, `npm run lint`, `npm run build` — všetko prešlo.
- Playwright (Chromium, emulácia iPhone 13 a 320 px, desktop 1280 px): filter Ihriská + 0–3 roky = 3 miesta (pred zmenou vekových skupín), hľadanie „kaviaren“ = 4, prázdny stav a „Zrušiť filtre“, ťuk na pin zvýrazní kartu, chyba → „Skúsiť znova“ → 11 miest, bez horizontálneho scrollu na 320 px, bez chýb v konzole. Screenshoty v `docs/screenshots/`.
- Kontrast textových farieb prepočítaný podľa WCAG (všetky textové páry ≥ 4,5 : 1).

**Známe obmedzenia**
- Mapa je statická ilustrácia (mapový provider je otvorené rozhodnutie). „Celá mapa“, detail miesta, Obľúbené a Profil zatiaľ zobrazia len oznámenie „pripravujeme“.
- Obľúbené sa držia iba v pamäti stránky (po obnovení zmiznú).
- Fotografie miest nahrádzajú abstraktné ilustračné náhľady.
- Netestované na fyzickom iPhone ani v Safari (iba Chromium emulácia).

## 2026-11-22 — Doplnené projektové dokumenty (návrhy)
- Pridané `PROTOTYPE_BRIEF.md`: účel, rozsah a poradie prototypu, obsah konceptu Domov, testovacie scenáre S1–S8, pravidlá DEMO dát, akceptačné kritériá.
- Pridané `DESIGN_SYSTEM_PROPOSAL.md`: princípy, farebné UI tokeny odvodené z palety B s tmavšími odtieňmi pre text, typografické varianty, škála, priestor, komponenty pre Domov.
- Pridané `MVP_ROADMAP.md`: fázy 0–5 s výstupnými bránami, návrhy na rozhodnutia pred backendom (mapový provider, vekové kategórie, KUTISKO skóre), riziká.
- Aktualizované `README.md` (stav dokumentov) a `DECISIONS.md`.
- Po spätnej väzbe vlastníka: zvolená typografia Plus Jakarta Sans, logo ponechané bez zmeny, pridaná ilustrácia dievčatka do `assets/illustrations/` (so súhlasom, bez metadát).
- Vlastník schválil a zapísané v DECISIONS: vekové skupiny 0–2, 3–5, 6–10, 10+; mapový klient MapLibre GL; KUTISKO skóre nie je v MVP.
- Overené: kontrastné pomery všetkých navrhnutých textových tokenov vypočítané podľa vzorca WCAG 2.1 (relatívna luminancia); textové tokeny spĺňajú AA na bielej, krémovej a `bg.subtle` s výnimkou `coral.600` na `bg.subtle` (4.29 : 1, len pre veľký text, uvedené v dokumente). Overená dostupnosť grafických referencií v projektových súboroch.
- Neoverené: vizuálny test farieb a typografie na zariadení (čaká na koncept Domov).
- Známe obmedzenia: finálne tokeny a poskytovateľ mapových dlaždíc sú len návrhy; aplikácia zatiaľ neexistuje.

## 2026-11-21 — Nastavenie projektu
- Vytvorený základ verejného repozitára KUTISKO.
- Pridané README, CLAUDE.md a .gitignore.
- Aktualizované pravidlá Claude Code: agilné iterácie, dôraz na UX/UI, evidencia zmien a rozhodnutí.
- Overené: súbory vytvorené cez GitHub; funkčný prototyp zatiaľ neexistuje.
- Otvorené: doplniť úplné produktové dokumenty v1.7, dodať originálne ilustrácie osobitne.
