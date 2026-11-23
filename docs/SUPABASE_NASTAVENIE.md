# Príprava Supabase pre etapu 1 — návod pre Martina

> Trvá asi 15 minút. Všetko robíš vo **svojich** účtoch; Claude k nim prístup nepotrebuje.
> **Kľúče a heslá nikdy nevkladaj do chatu, do repozitára ani do issue** — len do nastavení Vercelu a GitHubu
> (repozitár je verejný). Schválený návrh: `docs/BACKEND_NAVRH.md`.
>
> Názvy tlačidiel v Supabase a Verceli sa občas menia; ak niečo nesedí, hľadaj podobný názov.

## Prečo cez GitHub Actions
Prostredie, v ktorom Claude pracuje, sa na Supabase nepripojí (rovnako ako na Overpass). Zmeny databázy
(migrácie) a import miest preto pobežia v GitHub Actions — tak ako dnešný import ihrísk. Claude pripraví
kód a akcie, ty len uložíš kľúče.

## 1. Založ projekt Supabase
1. Na [supabase.com](https://supabase.com) sa prihlás (napr. cez GitHub) a klikni **New project**.
2. **Name:** `kutisko` · **Region:** **Central EU (Frankfurt)** · **Plan:** Free.
3. **Database password:** nechaj vygenerovať a ulož si ho do správcu hesiel (budeš ho potrebovať v kroku 3).
4. Počkaj, kým sa projekt vytvorí (1–2 minúty).

## 2. Skopíruj adresu a kľúče
V projekte: **Project Settings → API Keys** (alebo **Data API**):
- **Project URL** — `https://xxxx.supabase.co`
- **Publishable key** (`sb_publishable_…`, v starších projektoch „anon public“) — verejný, smie byť v aplikácii
- **Secret key** (`sb_secret_…`, v starších projektoch „service_role“) — **tajný**, má plný prístup

A v **Project Settings → Database → Connection string** (karta „URI“, režim **Session pooler**) adresu
databázy `postgresql://postgres.xxxx:[HESLO]@…pooler.supabase.com:5432/postgres` — za `[HESLO]` dosaď
heslo z kroku 1.

## 3. Ulož ich do GitHubu (pre migrácie a import)
GitHub → repozitár `kutisko` → **Settings → Secrets and variables → Actions → New repository secret**:

| Názov | Hodnota |
|-------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SECRET_KEY` | Secret key |
| `SUPABASE_DB_URL` | adresa databázy s heslom |

## 4. Ulož ich do Vercelu (pre aplikáciu)
Vercel → projekt `kutisko` → **Settings → Environment Variables** (prostredia Production aj Preview):

| Názov | Hodnota |
|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `SUPABASE_SECRET_KEY` | Secret key (len na serveri, v etape 1 sa ešte nepoužije) |

Kým tieto premenné nie sú nastavené, aplikácia ďalej beží z dnešných JSON súborov — nič sa nepokazí.

## 5. Daj vedieť
Stačí napísať „Supabase je pripravený“. Hodnoty kľúčov neposielaj.

## Čo potom urobí Claude (etapa 1)
1. Migrácia `supabase/migrations/…`: tabuľky `places`, `place_sources`, `import_runs` a pravidlá RLS
   (čítať zverejnené miesta môže každý, zapisovať len import a neskôr admin).
2. GitHub Action „Databáza: migrácie“ — spustí migrácie po zlúčení do `main`.
3. Seed: jednorazové nahratie 975 ihrísk a 11 herní/kútikov, ID ostávajú rovnaké.
4. Import ihrísk z OSM zapisuje aj do databázy (ručne upravené polia neprepíše, zmiznuté miesta označí
   „na kontrolu“). Pribudne týždenný rozvrh a „budíček“ proti uspatiu projektu.
5. Aplikácia číta katalóg z databázy s hodinovou cache a so zálohou na JSON, keď databáza neodpovedá.
6. Testy, kontrola na mobile, záznam v CHANGELOG — a PR na schválenie.

Etapa 1 neukladá žiadne osobné údaje.
