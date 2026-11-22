/**
 * Miesta v prototype pochádzajú zo skutočných zdrojov:
 *  - `source: "osm"` — verejné ihriská z OpenStreetMap (src/data/osm/playgrounds.json,
 *    generuje scripts/osm/import-playgrounds.mjs; © prispievatelia OpenStreetMap, ODbL).
 *  - `source: "web"` — vnútorné herne a kútiky, ktorých údaje kurátor ručne overil na webe
 *    prevádzky alebo obchodného centra (src/data/curated/indoor-places.json). Bez hodnotení,
 *    bez fotiek, bez údajov z Google. Neuvedené údaje ostávajú prázdne.
 *  - `source: "city"` — register mesta, zobrazí sa len po overení licencie (src/data/sources.ts).
 * Syntetické DEMO miesta ostali len ako testovacie dáta (src/data/demoFixtures.ts).
 */

import osmData from "./osm/playgrounds.json" with { type: "json" };
import cityData from "./osm/city-playgrounds.json" with { type: "json" };
import { CITY_REGISTER } from "./sources.ts";
import curatedData from "./curated/indoor-places.json" with { type: "json" };
import curatedGeo from "./curated/geo.json" with { type: "json" };

export type CategoryId = "kutik" | "herna" | "ihrisko";

export interface Category {
  id: CategoryId;
  label: string;
  shortLabel: string;
}

export const CATEGORIES: Category[] = [
  { id: "kutik", label: "Detské kútiky", shortLabel: "Kútik" },
  { id: "herna", label: "Vnútorné herne", shortLabel: "Herňa" },
  { id: "ihrisko", label: "Vonkajšie ihriská", shortLabel: "Ihrisko" },
];

export interface AgeBand {
  id: string;
  label: string;
  min: number;
  max: number;
}

/** Vekové skupiny filtra — schválené Martinom 2026-11-22 (0–2, 3–5, 6–10, 10+). Miesto má rozsah min–max, filter hľadá prekrytie. */
export const AGE_BANDS: AgeBand[] = [
  { id: "0-2", label: "0–2 roky", min: 0, max: 2 },
  { id: "3-5", label: "3–5 rokov", min: 3, max: 5 },
  { id: "6-10", label: "6–10 rokov", min: 6, max: 10 },
  { id: "10+", label: "10+ rokov", min: 10, max: 99 },
];

export type Price =
  | { kind: "free" }
  | { kind: "from"; amount: number }
  /** Bez vstupného pre hostí kaviarne/prevádzky. */
  | { kind: "purchase" }
  | { kind: "unknown" };

export interface HoursRow {
  days: string;
  hours: string;
}

export interface WebInfo {
  address: string;
  website: string;
  /** Stránky, z ktorých sú údaje (web prevádzky alebo obchodného centra). */
  sources: string[];
  /** Dátum overenia údajov (ISO). */
  checkedAt: string;
  description: string;
  priceNote: string | null;
  hoursWeek: HoursRow[] | null;
  /** true = poloha je len približná (presnú doplní geokódovanie z OSM). */
  approxPosition: boolean;
  /** Objekt v OSM, z ktorého je presná poloha. */
  geoOsm?: { type: string; id: number };
}

export interface Place {
  id: string;
  name: string;
  category: CategoryId;
  /** Mestská časť alebo obec. */
  area: string;
  lat: number;
  lng: number;
  /** Vekový rozsah; null = neuvedený (OSM ho takmer nikdy neobsahuje — nesmie pôsobiť negatívne). */
  ageMin: number | null;
  ageMax: number | null;
  /** Vnútorný priestor (true) alebo vonku (false). */
  indoor: boolean;
  /** Celkové skóre 1–10 (priemer rodičovských hodnotení) alebo null, ak hodnotenia chýbajú. */
  score: number | null;
  reviewCount: number;
  price: Price;
  /** Text dnešných hodín, alebo null = neoverené (nesmie sa tváriť ako „zatvorené“). */
  hoursToday: string | null;
  amenities: string[];
  /** Údaje overil kurátor KUTISKO (pri zdroji „web“: na webe prevádzky k dátumu `web.checkedAt`). */
  verified: boolean;
  /** true = vymyslené DEMO miesto (v aplikácii už žiadne nie sú, len v testoch). */
  isDemo: boolean;
  source: "demo" | "osm" | "city" | "web";
  /** Ručne overené údaje z webu prevádzky (len source „web“). */
  web?: WebInfo;
  /** Pôvodný objekt v OpenStreetMap (len source „osm“). */
  osm?: { type: "node" | "way" | "relation"; id: number };
  /** Surový tag opening_hours z OSM, ak existuje. */
  openingHours?: string | null;
  /** Povrch dopadovej plochy (OSM surface), ak je známy. */
  surface?: string | null;
  /** Ihrisko má vlastný názov v OSM (inak je názov odvodený z parku/ulice). */
  named?: boolean;
}

interface CuratedEntry {
  id: string;
  name: string;
  category: CategoryId;
  area: string;
  address: string;
  geocode: { queries: string[]; near: number[] };
  ageMin: number | null;
  ageMax: number | null;
  price: { kind: string; amount?: number };
  priceNote: string | null;
  hoursWeek: HoursRow[] | null;
  amenities: string[];
  description: string;
  website: string;
  sources: string[];
}
const GEO = (curatedGeo as { places: Record<string, { lat: number; lng: number; osm: { type: string; id: number } }> }).places;

/** Dnešné hodiny len pri jednoznačnom zápise „celý týždeň rovnako“, inak null (detail ukáže celý týždeň). */
function sameEveryDay(rows: HoursRow[] | null): string | null {
  if (!rows || rows.length !== 1) return null;
  return /^Po\s*–\s*Ne/.test(rows[0].days) ? rows[0].hours : null;
}

/** Skutočné vnútorné herne a kútiky overené na webe prevádzky (DECISIONS.md, 2026-11-22). */
export const CURATED_PLACES: Place[] = (curatedData.places as CuratedEntry[]).map((e) => {
  const geo = GEO[e.id];
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    area: e.area,
    lat: geo?.lat ?? e.geocode.near[0],
    lng: geo?.lng ?? e.geocode.near[1],
    ageMin: e.ageMin,
    ageMax: e.ageMax,
    indoor: true,
    score: null,
    reviewCount: 0,
    price: e.price as Price,
    hoursToday: sameEveryDay(e.hoursWeek),
    amenities: e.amenities,
    verified: true,
    isDemo: false,
    source: "web",
    web: {
      address: e.address,
      website: e.website,
      sources: e.sources,
      checkedAt: curatedData.checkedAt,
      description: e.description,
      priceNote: e.priceNote,
      hoursWeek: e.hoursWeek,
      approxPosition: !geo,
      ...(geo ? { geoOsm: geo.osm } : {}),
    },
  };
});

/** Všetky miesta: overené herne a kútiky + skutočné ihriská z OSM (+ mestské po overení licencie). */
export const PLACES: Place[] = [
  ...CURATED_PLACES,
  ...(osmData.places as unknown as Place[]),
  // Mestské ihriská chýbajúce v OSM — len ak je licencia mestskej vrstvy overená (src/data/sources.ts).
  ...(CITY_REGISTER.approved ? (cityData.places as unknown as Place[]) : []),
];

export const OSM_META = {
  attribution: osmData.attribution,
  license: osmData.license,
  osmTimestamp: osmData.osmTimestamp,
  count: osmData.places.length,
};

/** Referenčný bod pre vzdialenosť v prototype (centrum Bratislavy). Poloha používateľa sa nezisťuje. */
export const REFERENCE_POINT = { lat: 48.1435, lng: 17.1088, label: "centra" } as const;
