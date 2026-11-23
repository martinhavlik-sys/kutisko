# KUTISKO — Product Manifesto v1.7

Status: pracovná špecifikácia. Schválené rozhodnutia sú odlíšené od návrhov a otvorených otázok.

## Produkt
Mobilne orientovaná webová aplikácia pre rodičov na objavovanie, porovnávanie a hodnotenie detských kútikov, vnútorných herní a vonkajších ihrísk. Pilot: Bratislava a okolie; architektúra bez pevného regionálneho obmedzenia.

## Schválené produktové rozhodnutia
1. Kategórie: detské kútiky, vnútorné herne, vonkajšie ihriská.
2. ~~Registrácia je povinná pred používaním aplikácie.~~ *Zmenené 2026-11-23 (Martin, DECISIONS.md): prezerať miesta môže každý; účet je potrebný na uloženie miesta, hodnotenie, tip, fotku a návrh miesta.*
3. Údaje o miestach: legálne použiteľné externé zdroje, vlastný kurátorovaný katalóg, komunitné návrhy. Evidovať pôvod a overenie údajov.
4. Rodičia navrhujú nové miesta; zverejnenie až po schválení administrátorom.
5. Rozšírený detail miesta: názov, kategória, opis, fotografie, GPS/adresa/navigácia, vhodný vek, hodiny, cena, vybavenie, recenzie a údaj o overení. Neznáme údaje nesmú byť interpretované ako negatívne.
6. Kombinovaná mapa a zoznam: dashboard obsahuje náhľad mapy a zoznam; prepínanie plná mapa/zoznam; synchronizované filtre a výsledky.
7. Hodnotenia: celkové skóre 1–10; voliteľné podrobné kritériá, text a prípadne fotografie. Celkové a čiastkové skóre ukladať oddelene.
8. Personalizácia je voliteľná: preferovaný vek, lokalita, vzdialenosť; používateľ môže nastavenia preskočiť, zmeniť alebo vymazať.
9. Fotografie pridávajú administrátori a registrovaní rodičia; rodičovské fotografie vyžadujú pred zverejnením schválenie.
10. Recenzie sa po základnej kontrole publikujú automaticky; používateľ ich môže nahlásiť a administrátor preveriť, skryť alebo odstrániť bez prepisovania hodnotenia. Skryté/odstránené recenzie sa nezapočítavajú do verejného skóre.
11. Pilotná geografická oblasť: Bratislava a okolie.
12. Vizuálny smer: moderný, čistý a jemne hravý; mobil-first, vzdušné rozhranie pre rodičov, fotografie miest v popredí, jemné ilustrácie, čitateľnosť a prístupnosť.
13. Farebný smer: B – veselý/energický (teplá krémová, výrazná koralová, slnečná žltá, tyrkysová). Konkrétne HEX hodnoty sú pracovné, nie definitívne; povinné overenie kontrastu a použitia v UI.
14. Navigácia na miesto: po stlačení „Navigovať“ ponúknuť výber Apple Maps, Google Maps alebo Waze, s funkčnými webovými alternatívami. Vlastnú turn-by-turn navigáciu nevytvárať.

## UX navigácia (schválené a implementačné pravidlá)
- Tlačidlo „Navigovať“ v detaile miesta otvorí výber mapovej služby.
- Cieľ je GPS súradnica miesta; ak nie je dostupná, aplikácia nesmie predstierať presnú navigáciu a ponúkne overenú adresu, ak existuje.
- Web/PWA nevie spoľahlivo zistiť všetky nainštalované aplikácie. Ponuka preto neoznačuje služby ako „nainštalované“ bez overenia.
- Použiť oficiálne podporované URL schémy/deep linky, bezpečne kódovať parametre, pripraviť webový fallback.
- Výber navigácie nevyžaduje prístup k aktuálnej polohe používateľa v KUTISKU; štart určí externá služba.

## UX princípy
- Mobil ako primárne zariadenie, čisté vzdušné rozhranie, prívetivá ilustrácia bez zbytočných prekážok.
- Po opätovnom prihlásení priamo do vyhľadávania.
- Pri zamietnutej geolokácii ponúknuť manuálny výber mesta.
- Zreteľne rozlišovať overené a neoverené informácie; nepredstierať známe ceny či otváracie hodiny.
- Obľúbené miesta dostupné v profile; jednoduché uloženie/odstránenie.
- Prístupnosť, responzivita, zrozumiteľné prázdne a chybové stavy.

## Odporúčaný rozsah MVP (čaká na finálne potvrdenie)
- Auth, základný profil a voliteľné preferencie.
- Katalóg miest, detail, vyhľadávanie a filtre, kombinovaná mapa/zoznam.
- Obľúbené miesta, celkové a voliteľné podrobné hodnotenia.
- Návrhy nových miest a moderované fotografie.
- Admin fronta pre návrhy, fotografie, nahlásenia a úpravy katalógu.
- Pilotné dáta z Bratislavy a okolia; uzavreté testovanie pred verejným pilotom.

## Mimo MVP
Rezervácie, účty prevádzkovateľov, platené profily, reklama, AI odporúčania, offline mapy, zdieľané kolekcie.

## Bezpečnosť a dôvera — požiadavky
- Autorizácia a RLS v databáze; nikdy nespoliehať len na skryté prvky UI.
- Rodičovské fotografie držať súkromné až do schválenia, vytvárať bezpečné publikované verzie, odstrániť EXIF/GPS metadáta.
- Moderácia fotografií s identifikovateľnými deťmi a proces nahlásenia/odstránenia.
- Audit schvaľovacích a moderátorských zásahov.
- Ochrana pred spamom, limity uploadov a vstupov.
- GDPR: minimalizácia údajov, pravidlá retencie, export a vymazanie účtu.
- Recenzie nesmú byť umelo ovplyvnené platenou propagáciou.

## Otvorené rozhodnutia
- Finálne HEX tokeny, typografia, rozsah a umiestnenie ilustrácií, návrh loga a prístupnostné overenie (farebný smer B a princíp striedmeho používania ilustrácií sú schválené).
- Metodika a význam prípadného „KUTISKO skóre“ 1–5; nezobrazovať ho ako skutočný rating bez metodiky.
- Presné hranice pilotnej oblasti, počet/zdroj úvodných miest a proces kontroly dát.
- Mapový provider, jeho ceny, licencie a limity; pravidlá použitia externých dát a fotografií.
- Presné vekové kategórie, filtre, váhy zoradenia a pravidlá recenzií pri nízkom počte hodnotení.
- Finálny rozsah MVP a akceptačné kritériá.
- Autentifikačné metódy, notifikácie a konkrétna implementácia administrátorských rolí.

## Schválené rozhodnutie v1.6 — prototyp pred backendom
15. Najprv vytvoriť interaktívny mobil-first prototyp s ukážkovými dátami, bez produkčného backendu. Až po UX testovaní a odsúhlasení pripojiť autentifikáciu, Supabase a skutočný obsah.
16. Prototyp musí obsahovať klikateľné toky: Domov → filtrovanie → mapa/zoznam → detail → výber externej navigácie; Uložené; Profil; simulované hodnotenie, návrh miesta a pridanie fotografie; náhľad administrátorskej fronty.
17. Simulované účty a zápisy musia byť jasne označené ako demo; nesmú vyvolávať dojem bezpečného serverového uloženia ani publikovania. Nepoužívať skutočné osobné údaje ani fotografie detí.
18. ~~Povinná registrácia zostáva požiadavkou na produkčné MVP.~~ *Zmenené 2026-11-23: v MVP je účet povinný len na zápisy (pozri bod 2).* V prototype sa jej tok iba simuluje.

## Brána medzi prototypom a backendom
- Otestovať na iPhone hlavné scenáre a stavy: bez polohy, nulové výsledky, neznáme údaje, prázdne obľúbené, chybný formulár.
- Potvrdiť návrh navigácie a dizajnové tokeny po vizuálnom teste.
- Pred backendom uzavrieť mapového providera, licencie dát, pravidlá súkromia a akceptačné kritériá.

## Schválené rozhodnutia v1.7 — identita a poradie dizajnu
19. Aplikácia je navrhnutá predovšetkým pre rodičov: funkčná, prehľadná, elegantná, moderná, vzdušná. Má pôsobiť kvalitne a dôveryhodne; nie ako rozhranie pre malé deti.
20. Farebný smer B – veselý/energický – nahrádza predchádzajúci smer A. Pracovné farby: Warm Cream `#FFF8E7`, Vibrant Coral `#FF526E`, Sunny Yellow `#F5AD1D`, Bright Turquoise `#5DC2D6`. Nie sú to finálne prístupnostne overené UI tokeny. Farby používať s mierou, neutrálne plochy nechávajú vyniknúť obsah.
21. Originálne ilustrácie od Simonky sú rozpoznávacím prvkom značky, nie hlavnou súčasťou každej obrazovky. Použiť ich výberovo, napríklad pri úvode, prázdnych stavoch alebo vo vhodných mikrodetailoch. Zachovať autorský charakter; bez schválenia ich neprekresľovať do generického štýlu.
22. Existujúce súbory `app kutisko.ai`, `app kutisko.psd` a `kutisko mockup.pptx` sú vizuálnymi a obsahovými referenciami. Pôvodné rozloženie obrazoviek NIE JE záväzný UI návrh. Súbory musí mať realizátor skutočne k dispozícii; samotný odkaz alebo textový opis ich nenahrádza.
23. Existujúce typografické logo KUTISKO nie je finálne. V prototype môže byť dočasným wordmarkom; návrh nového loga je samostatná neskoršia úloha a nesmie blokovať prototyp.
24. Pred vývojom všetkých obrazoviek najprv navrhnúť JEDEN kvalitný, zobraziteľný a mobilný koncept obrazovky Domov; používateľ schváli vizuálny jazyk (hierarchiu, typografiu, farby, karty, rozostupy, mieru ilustrácií). Až po schválení odvodiť ďalšie obrazovky a interakcie.
25. Obsah a orientácia majú prednosť pred dekoráciou: fotografie miest, vyhľadávanie, filtre, mapa/zoznam a praktické údaje sú dominantné; ilustrácie im nekonkurujú.

## Aktuálne poradie realizácie (záväzné)
1. Zjednotiť dokumentáciu a overiť dostupnosť grafických referencií.
2. Claude Code predloží plán a vytvorí vizuálny koncept obrazovky Domov s jasne označenými DEMO dátami; bez backendu.
3. Po vizuálnom schválení vytvoriť interaktívny prototyp podľa `PROTOTYPE_BRIEF.md`.
4. Test na iPhone, úpravy a schválenie UX.
5. Až následne samostatné rozhodnutie o implementácii produkčného MVP a backendu.

## Stav rozhodnutí
- **Schválené:** cieľová skupina, UX priority, farebný smer B, striedme používanie Simonkiných kresieb, voľnosť pri redizajne, prototyp pred backendom, vizuálne schválenie Domov pred ďalšími obrazovkami.
- **Otvorené:** finálne logo, konkrétna typografia, finálne UI tokeny a kontrasty, presné rozmiestnenie kresieb, finálny mapový provider a náklady, rozsah produkčného MVP.
