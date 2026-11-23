# KUTISKO — návrh backendu

> **Stav:** návrh na schválenie (23. 11. 2026). Nič z toho nie je implementované a nič nie je rozhodnuté,
> kým to Martin neschváli. Manifest (bod 15, „Brána medzi prototypom a backendom“) vyžaduje pre backend
> samostatné rozhodnutie; tento dokument ho pripravuje.
>
> Ceny a limity služieb sú orientačné podľa verejných cenníkov, ktoré poznáme. **Pred založením účtov ich
> treba overiť v aktuálnom cenníku**, lebo sa menia.

## 1. Zhrnutie v skratke

- **Odporúčanie:** jedna služba **Supabase** (databáza Postgres, prihlásenie, úložisko fotiek) v regióne EÚ
  (Frankfurt). Aplikácia ostáva na **Verceli**, import dát ostáva v **GitHub Actions**.
- **Poloha rodiča nikdy neopustí telefón.** Vzdialenosť a „Najbližšie“ sa počítajú v prehliadači ako dnes.
- **Fotky** najprv v Supabase Storage (jednoduchšie, jedno miesto na práva). Cloudflare R2 až pri raste.
- **Prihlásenie:** e-mail (odkaz/kód do schránky) + Google hneď; **Apple** neskôr (stojí 99 USD ročne).
- **Náklady na štart: 0 €/mesiac.** Pred verejným spustením odporúčame Supabase Pro (cca 25 USD/mesiac),
  lebo bezplatný projekt sa po týždni nečinnosti uspí a nemá denné zálohy.
- **Postup v 5 etapách**, každá je samostatne použiteľná a ide cez vlastný PR. Prvá (katalóg miest v databáze)
  ešte nepracuje s osobnými údajmi.

## 2. Na rozhodnutie (Martin)

| # | Otázka | Možnosti | Odporúčanie |
|---|--------|----------|-------------|
| R1 | **Poskytovateľ backendu** | a) Supabase · b) Firebase (Google) · c) vlastný server + databáza | **a) Supabase** — Postgres so zabezpečením priamo v databáze (RLS, manifest to vyžaduje), EÚ región, štedrý bezplatný plán, bez viazanosti (štandardný Postgres sa dá presťahovať). Firebase je NoSQL a ťažšie sa v ňom robia porovnania a štatistiky; vlastný server znamená údržbu. |
| R2 | **Musí byť registrácia povinná pred používaním?** | a) Áno, ako hovorí manifest (bod 2, 18) · b) Prezerať miesta môže každý, účet treba až na uloženie, hodnotenie, tip, fotku a návrh | **b)** Rodič, ktorému niekto pošle odkaz na herňu, ju uvidí hneď; vyhľadávače stránky miest nájdu; menej ľudí odíde pri prvom otvorení. Zápisy (to, čo treba chrániť) budú aj tak len s účtom. Ide o zmenu manifestu, preto rozhoduješ ty. |
| R3 | **Spôsoby prihlásenia na štart** | a) E-mail + Google · b) E-mail + Google + Apple · c) Len e-mail | **a)**, Apple pridať pred verejným spustením. „Prihlásiť cez Apple“ vyžaduje platené Apple Developer konto (99 USD/rok). Ak ho kvôli budúcej aplikácii v App Store aj tak plánuješ, môžeme dať b). |
| R4 | **Úložisko fotiek** | a) Supabase Storage · b) Cloudflare R2 | **a)** na štart (1 GB zadarmo, v Pro 100 GB, práva cez rovnaké pravidlá ako databáza). R2 (10 GB zadarmo, bez poplatkov za sťahovanie) zvážiť, keď fotiek bude veľa — výmena sa dotkne len jedného modulu. |
| R5 | **Čo sa stane s recenziami po zrušení účtu** | a) Zmažú sa aj s fotkami · b) Ostanú anonymne („Rodič“) | **a)** — jednoduchšie a čistejšie z pohľadu GDPR. Priemer miesta sa prepočíta. |
| R6 | **Kedy prejsť na platený Supabase Pro** | a) Až pri verejnom spustení · b) Hneď pri teste s rodičmi | **a)** Pri teste stačí bezplatný plán (uspatie riešime pravidelným „budíčkom“ z GitHub Actions). Pred verejným spustením Pro kvôli zálohám. |

Ostatné (štruktúra tabuliek, knižnice, poradie prác) rozhodneme my v rámci schváleného smeru.

> **Upozornenie k Vercelu:** bezplatný plán Hobby je podľa podmienok Vercelu len na nekomerčné použitie.
> Kým je KUTISKO bez príjmov, je to v poriadku. Ak sa spustí monetizácia (docs/MONETIZACIA.md), treba
> Vercel Pro (cca 20 USD/mesiac).

## 3. Architektúra

```
 iPhone (PWA, Safari)
   │  poloha ostáva v telefóne, filtre a vzdialenosť sa počítajú tu
   ▼
 Vercel — Next.js (stránky, serverové akcie, admin)
   │  verejný kľúč + prihlásenie používateľa (cookie)        │ tajný kľúč len na serveri
   ▼                                                          ▼  (schvaľovanie fotiek, admin)
 Supabase (EÚ – Frankfurt)
   ├─ Auth: e-mail, Google, (Apple)
   ├─ Postgres: miesta, hodnotenia, tipy, fotky, návrhy, uložené, audit … + pravidlá RLS
   └─ Storage: fotky „na schválenie“ (súkromné) → „zverejnené“ (verejné, bez metadát)
   ▲
 GitHub Actions — týždenný import ihrísk z OSM a poloha herní → zapíše do databázy
```

- **Čítanie katalógu:** zoznam miest (dnes ~990 záznamov, cca 400 kB) sa načíta naraz a Vercel ho drží
  v cache (obnova raz za hodinu a hneď po importe). Mapa a vyhľadávanie tak ostanú rovnako rýchle ako dnes
  a poloha sa na server nikdy neposiela.
- **Zápisy** (hodnotenie, tip, fotka, návrh, uloženie) idú cez serverové akcie Next.js s prihláseným
  používateľom; databáza navyše sama overí, že smie (RLS) — nikdy sa nespoliehame len na skryté tlačidlo.
- **Nové závislosti:** `@supabase/supabase-js`, `@supabase/ssr` a na úpravu fotiek na serveri `sharp`.
  Nič iné.
- **Kľúče:** verejný kľúč a adresa projektu v premenných prostredia Vercelu; tajný (service role) kľúč len
  v prostredí Vercelu a ako GitHub Secret pre import. **Nikdy v repozitári** (repo je verejné).

## 4. Dátový model

Prehľad tabuliek. Podrobný návrh SQL je v [prílohe A](#príloha-a--návrh-sql). Identifikátory miest ostávajú
rovnaké ako dnes (`osm-n10037590917`, `web-simba-petrzalka`), aby fungovali staré odkazy a obľúbené.

### Katalóg
| Tabuľka | Čo obsahuje |
|---------|-------------|
| `places` | Všetky miesta: názov, kategória (kútik/herňa/ihrisko), mestská časť, adresa, poloha, vek od–do, vnútri/vonku, cena, hodiny (týždeň), vybavenie, opis, web, kontakt, **zdroj** (`osm` / `web` / `city` / `community` / `operator`), odkaz na pôvodný objekt v OSM, **overené kedy a kým**, stav (zverejnené / skryté / zatvorené / na kontrolu). |
| `place_sources` | Odkiaľ je ktorý údaj a kedy bol overený (web prevádzky, OC, OSM). Nahrádza dnešné `sources` + `checkedAt`. |
| `place_stats` | Vypočítané: priemer hodnotení 1–10, počet, priemery kritérií, počet fotiek. Počíta sa len zo zverejnených recenzií (manifest bod 10). |
| `import_runs` | Záznam každého importu (kedy, koľko pribudlo, zmenilo sa, zmizlo). |

### Komunita
| Tabuľka | Čo obsahuje |
|---------|-------------|
| `reviews` | Hodnotenie rodiča: celkové 1–10, čistota a kreativita (voliteľné, ukladané oddelene — manifest bod 7), text, stav (zverejnené / skryté / odstránené). **Jedno hodnotenie na miesto a rodiča** (nové nahradí staré, ako v prototype). |
| `tips` | Krátky praktický tip (10–160 znakov), stav ako pri recenziách. |
| `photos` | Fotka miesta: kto ju pridal (rodič / prevádzka / tím), cesta k súkromnému originálu a k zverejnenej verzii, popis pre čítačky, stav (čaká / schválená / zamietnutá + dôvod), kto a kedy rozhodol. Voliteľne naviazaná na recenziu. |
| `suggestions` | Návrh nového miesta od rodiča; po schválení vznikne riadok v `places` a návrh si pamätá jeho ID. |
| `reports` | Nahlásenie (miesta, recenzie, tipu, fotky, neskôr akcie): dôvod, poznámka, stav, kto vyriešil. |

### Používatelia
| Tabuľka | Čo obsahuje |
|---------|-------------|
| `auth.users` | Spravuje Supabase (e-mail, spôsob prihlásenia). Heslá neukladáme vôbec — prihlasuje sa odkazom/kódom alebo cez Google/Apple. |
| `profiles` | Meno na zobrazenie, rola (`parent` / `moderator` / `admin`), preferencie (vek, mesto, okruh v km), súhlas s podmienkami (verzia a dátum). **Bez polohy, bez dátumu narodenia, bez údajov o deťoch** okrem voliteľnej vekovej skupiny. |
| `saved_places` | Obľúbené miesta (používateľ + miesto + dátum). |

### Administrácia
| Tabuľka | Čo obsahuje |
|---------|-------------|
| `audit_log` | Každé schválenie, zamietnutie, skrytie, úprava katalógu a zmena roly: kto, kedy, čo, prečo (manifest: audit zásahov). Nedá sa upraviť ani zmazať z aplikácie. |

### Neskôr (len pripravené, nie v prvých etapách)
`operators` (účty prevádzok a ich miesta), `events` (akcie na 14 dní, schvaľované ako recenzie),
`promotions` (sponzorované zvýraznenie: miesto, oblasť, od–do). Podľa manifestu sú mimo MVP; navrhneme ich,
až Martin rozhodne otázky v docs/MONETIZACIA.md. Platba nikdy nezmení hodnotenia, poradie „Odporúčané“ ani
„Overené“ — v databáze sú tieto údaje oddelené.

## 5. Kto čo smie (RLS)

| Údaj | Ktokoľvek (aj bez účtu, ak R2 = b) | Prihlásený rodič | Moderátor / admin |
|------|------------------------------------|------------------|-------------------|
| Zverejnené miesta, štatistiky | čítať | čítať | čítať, upravovať, skrývať |
| Recenzie, tipy | čítať zverejnené (s menom autora, bez e-mailu) | pridať / upraviť / zmazať **svoje** | skryť, odstrániť, obnoviť |
| Fotky | vidieť len schválené | nahrať (max 5 čakajúcich na miesto), vidieť **svoje** čakajúce | vidieť všetky, schváliť / zamietnuť |
| Návrhy miest, nahlásenia | — | pridať, vidieť **svoje** | vidieť všetky, vybaviť |
| Uložené, profil | — | len **svoje** | — (admin nevidí obľúbené cudzích ľudí) |
| Audit | — | — | čítať (len admin) |

Rolu `moderator`/`admin` prideľuje len admin; prvý admin bude Martin (nastaví sa ručne raz).

## 6. Prihlásenie

- **E-mail bez hesla:** rodič zadá e-mail, príde mu 6-miestny kód a odkaz. Kód je dôležitý pre iPhone:
  odkaz z e-mailu sa otvorí v Safari, nie v aplikácii pridanej na plochu, kód sa dá prepísať priamo v nej.
- **Google:** bezplatné, nastavenie v Google Cloud Console (Martinov Google účet).
- **Apple:** vyžaduje Apple Developer Program (99 USD/rok). Apple pri ňom môže skryť e-mail rodiča — s tým
  počítame (meno sa doplní pri prvom prihlásení).
- **Odosielanie e-mailov:** vstavaný e-mail Supabase zvládne len pár správ za hodinu, na test nestačí.
  Odporúčame bezplatný plán **Resend** alebo **Brevo** (cca 3 000 / 9 000 e-mailov mesačne zadarmo) s
  odosielateľom na doméne kutisko.sk. Je to ďalšia (bezplatná) služba — pred založením sa ešte spýtame.
- **Uvítanie** „Ahoj [meno]“ po registrácii aj po každom prihlásení ostáva, ako si rozhodol 22. 11.

## 7. Moderácia a administrácia

Administrácia ostáva v aplikácii na `/admin` (dnešná ukážka sa napojí na databázu), prístupná len s rolou.

- **Recenzie a tipy:** po základnej automatickej kontrole (dĺžka, zakázané slová, odkazy, telefónne čísla,
  max. počet za deň) sa **zverejnia hneď** (manifest bod 10). Ktokoľvek ich môže nahlásiť; moderátor ich
  skryje alebo odstráni, hodnotenie sa neprepisuje a skryté sa nezapočítajú do priemeru.
- **Fotky:** nikdy sa nezverejnia bez schválenia (manifest bod 9). Postup:
  1. telefón fotku zmenší a odstráni polohu/EXIF (už to robí prototyp),
  2. nahrá sa do **súkromného** priečinka, vidí ju len autor a moderátor,
  3. moderátor ju v administrácii schváli → server ju znova spracuje (`sharp`: odstráni všetky metadáta,
     vytvorí 2 veľkosti) a uloží do **verejného** priečinka; originál sa zmaže,
  4. pri zamietnutí sa fotka zmaže do 30 dní, autor vidí dôvod.
  Pravidlá pre rodičov: žiadne rozpoznateľné tváre detí, žiadne ŠPZ, len priestor miesta.
- **Návrhy miest:** moderátor návrh doplní a schváli → vznikne nové miesto so zdrojom `community`.
- **Nahlásenia:** jedna fronta pre všetko, triedená podľa veku nahlásenia.
- **Audit:** každý zásah sa zapíše do `audit_log` automaticky (databázovým triggerom, nedá sa obísť).

## 8. GDPR a súkromie

- **Poloha len v pamäti telefónu** — ostáva presne ako dnes (src/lib/location.ts). Server ju nikdy nedostane,
  lebo katalóg sa filtruje v prehliadači. Do databázy sa neukladá ani mesto zistené z polohy.
- **Minimum údajov:** e-mail, meno na zobrazenie, voliteľne veková skupina, mesto a okruh. Nič o deťoch.
- **Údaje v EÚ:** Supabase región Frankfurt; so Supabase a Vercelom uzavrieť zmluvu o spracúvaní (DPA) —
  obe ju ponúkajú v štandardných podmienkach.
- **Export a vymazanie účtu** v Profile: export ako JSON súbor; vymazanie odstráni profil, obľúbené,
  recenzie, tipy a fotky (podľa R5) do 30 dní aj zo záloh.
- **Retencia:** zamietnuté fotky 30 dní, vybavené nahlásenia 12 mesiacov, audit 24 mesiacov, neaktívne účty
  (bez prihlásenia 24 mesiacov) upozorniť a potom zmazať. [NÁVRH — lehoty potvrdí Martin / právnik]
- **Cookies:** prihlasovacia cookie je nevyhnutná, súhlas netreba. Ak meranie návštevnosti bude bez cookies
  (napr. Vercel Analytics alebo Plausible), banner so súhlasom nebude potrebný.
- **Dokumenty pred spustením:** zásady ochrany súkromia, podmienky používania, pravidlá pre recenzie a fotky.
  Pripravíme návrh, odporúčame krátku kontrolu právnikom.

## 9. Import dát cez GitHub Actions

Cloud prostredie Claude nemá prístup na Overpass ani Nominatim, preto import ostáva v GitHub Actions.

- Dnes: akcia stiahne ihriská a commitne JSON do repozitára. **Nové:** po teste a transformácii ich
  zapíše do databázy (tajný kľúč v GitHub Secrets). JSON ostane v repozitári ako záloha a história zmien.
- **Pravidlá zlúčenia:** údaje z OSM sa aktualizujú, ale **ručne upravené polia sa neprepíšu** (každé miesto
  si pamätá, ktoré polia upravil tím). Ihrisko, ktoré z OSM zmizne, sa nezmaže, ale označí „na kontrolu“.
- **Rozvrh:** raz týždenne + ručné spustenie; výsledok v `import_runs`.
- **Herne a kútiky** (ručne overené) sa po migrácii spravujú priamo v administrácii; JSON súbor sa
  importuje jednorazovo. Akcia na doplnenie polohy z OSM ostane pre nové herne.
- **Mestské ihriská** ostávajú vypnuté, kým mesto nepotvrdí licenciu (docs/MESTSKE_IHRISKA.md).
- **„Budíček“:** malá akcia každé 3 dni zavolá databázu, aby sa bezplatný projekt neuspal.

## 10. Migrácia z dnešných lokálnych dát

| Dnes (prehliadač / repozitár) | Po migrácii |
|-------------------------------|-------------|
| `src/data/osm/playgrounds.json`, `src/data/curated/*.json` | jednorazový skript naplní `places` a `place_sources`, ID ostávajú |
| `kutisko.demo.saved` (obľúbené) | po prvom prihlásení ponúkneme „Preniesť 4 obľúbené do účtu?“ |
| `kutisko.demo.preferences` (vek, mesto, okruh) | rovnaká ponuka, potom sa ukladajú k účtu; bez účtu ostávajú v prehliadači |
| `kutisko.location.enabled` | ostáva v prehliadači (len príznak, nie poloha) |
| `kutisko.demo.account` | zruší sa, nahradí ho skutočné prihlásenie |
| DEMO recenzie, tipy, fotky, návrhy, nahlásenia, audit | **neprenášajú sa** (boli označené ako ukážka, manifest bod 17); po prihlásení sa z prehliadača zmažú |
| Ukážka sponzorovaných miest a akcií | ostáva ako ukážka, kým Martin nerozhodne monetizáciu |

Technicky: obrazovky už dnes čítajú cez malé moduly (`src/lib/community.ts`, `saved.ts`, `gallery.ts`,
`preferences.ts`). Tie dostanú druhú implementáciu nad Supabase a prepínač, takže obrazovky sa takmer
nemenia a prototyp vieme kedykoľvek pustiť aj bez backendu (napr. v náhľadoch PR).

## 11. Náklady (orientačne, overiť pred založením)

| Služba | Na štart | Kedy platiť | Potom |
|--------|----------|-------------|-------|
| Supabase | Free: 500 MB databáza, 1 GB fotky, 5 GB prenos, 50 000 aktívnych používateľov/mesiac; uspí sa po 7 dňoch nečinnosti, bez záloh | pred verejným spustením | Pro cca 25 USD/mesiac (8 GB DB, 100 GB fotky, denné zálohy, bez uspávania) |
| Vercel | Hobby 0 € | pri monetizácii (komerčné použitie) | Pro cca 20 USD/mesiac |
| E-maily (Resend/Brevo) | 0 € | nad cca 3 000 e-mailov/mesiac | cca 20 USD/mesiac |
| Google prihlásenie | 0 € | — | — |
| Apple prihlásenie | — | keď ho zapneme | 99 USD/rok |
| Cloudflare R2 (voliteľne) | 10 GB zadarmo | nad 10 GB | cca 0,015 USD/GB mesačne |
| GitHub Actions | 0 € (verejné repo) | — | — |
| Doména kutisko.sk | — | — | cca 10–15 €/rok |

**Spolu:** test s rodičmi 0 €/mesiac; verejné spustenie cca 25 USD/mesiac (+ Apple 99 USD/rok, ak áno);
s monetizáciou cca 45 USD/mesiac. Dnešný katalóg zaberie v databáze pod 5 MB, takže limity pri pilote
v Bratislave nehrozia; prvý limit, ktorý sa minie, budú fotky (1 GB ≈ 5 000 fotiek po 200 kB).

## 12. Postup po etapách

Každá etapa = samostatný PR, testy, záznam v CHANGELOG. Pred etapou 2 treba Martinov súhlas s prácou so
skutočnými osobnými údajmi (CLAUDE.md).

| Etapa | Čo pribudne | Čo treba od Martina |
|-------|-------------|---------------------|
| **0. Príprava** | schválenie tohto návrhu, zápis do DECISIONS | rozhodnúť R1–R6; založiť projekt Supabase (EÚ) vo svojom účte a vložiť kľúče do Vercelu a GitHub Secrets (pošleme presný návod, kľúče nikdy nie do chatu ani repa) |
| **1. Katalóg v databáze** | tabuľky miest, seed z JSON, import z GitHub Actions do databázy, aplikácia číta z databázy (s cache a zálohou na JSON) | nič — žiadne osobné údaje |
| **2. Účty** | prihlásenie e-mailom a Google, profil, preferencie a obľúbené k účtu, prenos z prehliadača, export a vymazanie účtu | súhlas s osobnými údajmi; Google Cloud prihlásenie; služba na e-maily |
| **3. Hodnotenia a tipy** | zápis recenzií a tipov, automatická kontrola, nahlásenia, roly, moderácia recenzií v `/admin`, audit | stať sa prvým adminom |
| **4. Fotky a návrhy** | nahrávanie fotiek, schvaľovanie, zverejnené verzie bez metadát, návrhy miest, celá admin fronta | pravidlá pre fotky (návrh pripravíme) |
| **5. Pred spustením** | zásady súkromia, podmienky, pravidlá recenzií, zálohy (Pro), sledovanie chýb, Apple prihlásenie | prechod na Pro, Apple Developer konto, kontrola textov |

Odhad: etapy 1–4 sú každá zhruba na jedno až dve pracovné vlákna; etapa 1 môže začať hneď po schválení.

## Príloha A — návrh SQL

Len na ilustráciu štruktúry; finálna verzia vznikne ako migrácie v `supabase/migrations/` v etape 1–4.

```sql
-- Katalóg ---------------------------------------------------------------
create type place_category as enum ('kutik', 'herna', 'ihrisko');
create type place_source   as enum ('osm', 'web', 'city', 'community', 'operator');
create type place_status   as enum ('published', 'hidden', 'closed', 'review');

create table places (
  id            text primary key,              -- 'osm-n10037590917', 'web-simba-petrzalka'
  name          text not null,
  name_source   text,                          -- osm | park | street | place | area | none
  category      place_category not null,
  area          text not null,
  address       text,
  lat           double precision not null,
  lng           double precision not null,
  age_min       smallint, age_max smallint,    -- null = neuvedené (nie negatívne)
  indoor        boolean not null,
  price         jsonb not null default '{"kind":"unknown"}',
  price_note    text,
  hours_week    jsonb,                         -- [{days, hours}] alebo null = neoverené
  opening_hours text,                          -- surový OSM tag
  amenities     text[] not null default '{}',
  surface       text,
  description   text,
  website       text,
  contact       jsonb,
  source        place_source not null,
  osm_type      text, osm_id bigint,
  verified_at   timestamptz, verified_by uuid references auth.users,
  locked_fields text[] not null default '{}',  -- ručne upravené polia, import ich neprepíše
  status        place_status not null default 'published',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (osm_type, osm_id)
);

create table place_sources (
  place_id   text references places on delete cascade,
  url        text not null,
  checked_at date not null,
  primary key (place_id, url)
);

-- Používatelia ----------------------------------------------------------
create type user_role as enum ('parent', 'moderator', 'admin');

create table profiles (
  id             uuid primary key references auth.users on delete cascade,
  display_name   text not null check (char_length(display_name) between 2 and 40),
  role           user_role not null default 'parent',
  age_band       text,                          -- '0-2' | '3-5' | '6-10' | '10+'
  city           text,
  radius_km      smallint,
  terms_version  text, terms_accepted_at timestamptz,
  created_at     timestamptz not null default now()
);

create table saved_places (
  user_id  uuid references auth.users on delete cascade,
  place_id text references places on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- Komunita --------------------------------------------------------------
create type content_status as enum ('published', 'hidden', 'removed');
create type photo_status   as enum ('pending', 'approved', 'rejected');

create table reviews (
  id          uuid primary key default gen_random_uuid(),
  place_id    text not null references places on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  overall     smallint not null check (overall between 1 and 10),
  cleanliness smallint check (cleanliness between 1 and 10),
  creativity  smallint check (creativity between 1 and 10),
  text        text check (char_length(text) <= 1000),
  status      content_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (place_id, user_id)                    -- jedno hodnotenie na miesto
);

create table tips (
  id         uuid primary key default gen_random_uuid(),
  place_id   text not null references places on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  text       text not null check (char_length(text) between 10 and 160),
  status     content_status not null default 'published',
  created_at timestamptz not null default now()
);

create table photos (
  id            uuid primary key default gen_random_uuid(),
  place_id      text not null references places on delete cascade,
  user_id       uuid references auth.users on delete set null,
  review_id     uuid references reviews on delete set null,
  origin        text not null check (origin in ('parent', 'operator', 'kutisko')),
  private_path  text,                           -- bucket 'photos-pending' (súkromný)
  public_path   text,                           -- bucket 'photos' (verejný, bez metadát)
  alt           text,
  status        photo_status not null default 'pending',
  reject_reason text,
  decided_by    uuid references auth.users, decided_at timestamptz,
  created_at    timestamptz not null default now()
);

create table suggestions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  name        text not null, category place_category not null, area text not null,
  age_min     smallint, age_max smallint, description text,
  status      photo_status not null default 'pending',
  place_id    text references places,           -- vyplní sa po schválení
  created_at  timestamptz not null default now()
);

create table reports (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('place', 'review', 'tip', 'photo', 'event')),
  target_id   text not null,
  reporter_id uuid references auth.users on delete set null,
  reason      text not null, note text,
  status      text not null default 'open' check (status in ('open', 'resolved')),
  resolved_by uuid references auth.users, resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

-- Administrácia ---------------------------------------------------------
create table audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users on delete set null,
  action      text not null,                    -- 'photo.approve', 'review.hide', 'place.update' …
  target_type text not null, target_id text not null,
  details     jsonb,
  at          timestamptz not null default now()
);

create view place_stats as
  select place_id,
         round(avg(overall)::numeric, 1) as score,
         count(*)                         as review_count,
         round(avg(cleanliness)::numeric, 1) as cleanliness,
         round(avg(creativity)::numeric, 1)  as creativity
  from reviews where status = 'published' group by place_id;

-- Ukážka RLS ------------------------------------------------------------
alter table reviews enable row level security;

create function is_staff() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('moderator', 'admin'))
$$;

create policy "verejné recenzie číta každý" on reviews for select
  using (status = 'published' or user_id = auth.uid() or is_staff());
create policy "rodič pridá svoju recenziu" on reviews for insert
  with check (user_id = auth.uid());
create policy "rodič upraví svoju recenziu" on reviews for update
  using (user_id = auth.uid() and status = 'published')   -- skrytú recenziu rodič neobnoví
  with check (user_id = auth.uid() and status = 'published');
-- stĺpec status smie meniť len moderátor (grant update na stĺpce bez status pre rolu authenticated)
create policy "moderátor mení stav" on reviews for update using (is_staff());
create policy "rodič zmaže svoju recenziu" on reviews for delete using (user_id = auth.uid());
```
