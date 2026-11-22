/**
 * Miesta v prototype pochádzajú z dvoch zdrojov:
 *  - `source: "osm"` — SKUTOČNÉ verejné ihriská z OpenStreetMap (src/data/osm/playgrounds.json,
 *    generuje scripts/osm/import-playgrounds.mjs; © prispievatelia OpenStreetMap, ODbL).
 *  - `source: "demo"` — SYNTETICKÉ DEMO kútiky a herne nižšie (vymyslené, označené „DEMO“).
 *
 * SYNTETICKÉ DEMO DÁTA — nie sú to skutočné prevádzky.
 *
 * Názvy, hodnotenia, ceny, hodiny aj vybavenie sú vymyslené pre účely
 * prototypu (PRODUCT_MANIFESTO.md, body 15–17). Súradnice ležia len približne
 * v uvedených mestských častiach / obciach Bratislavy a okolia, aby mapa
 * a vzdialenosti pôsobili realisticky. Nepoužívať ako zdroj informácií.
 */

import osmData from "./osm/playgrounds.json" with { type: "json" };
import cityData from "./osm/city-playgrounds.json" with { type: "json" };
import { CITY_REGISTER } from "./sources.ts";

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
  | { kind: "unknown" };

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
  /** Údaje overil kurátor KUTISKO (simulované). */
  verified: boolean;
  /** true = vymyslené DEMO miesto. */
  isDemo: boolean;
  source: "demo" | "osm" | "city";
  /** Pôvodný objekt v OpenStreetMap (len source „osm“). */
  osm?: { type: "node" | "way" | "relation"; id: number };
  /** Surový tag opening_hours z OSM, ak existuje. */
  openingHours?: string | null;
  /** Povrch dopadovej plochy (OSM surface), ak je známy. */
  surface?: string | null;
  /** Ihrisko má vlastný názov v OSM (inak je názov odvodený z parku/ulice). */
  named?: boolean;
}

export const DEMO_PLACES: Place[] = [
  {
    id: "demo-01",
    name: "Kútik Mravenisko",
    category: "kutik",
    area: "Staré Mesto",
    lat: 48.1452,
    lng: 17.1125,
    ageMin: 1,
    ageMax: 6,
    indoor: true,
    score: 8.9,
    reviewCount: 42,
    price: { kind: "from", amount: 5 },
    hoursToday: "9:00 – 19:00",
    amenities: ["kaviareň", "prebaľovací pult", "detské menu"],
    verified: true,
    isDemo: true,
    source: "demo",
  },
  {
    id: "demo-02",
    name: "Herňa Skokan",
    category: "herna",
    area: "Ružinov",
    lat: 48.1585,
    lng: 17.1612,
    ageMin: 3,
    ageMax: 12,
    indoor: true,
    score: 9.2,
    reviewCount: 118,
    price: { kind: "from", amount: 9 },
    hoursToday: "10:00 – 20:00",
    amenities: ["trampolíny", "oslavy", "kaviareň", "parkovanie"],
    verified: true,
    isDemo: true,
    source: "demo",
  },
  {
    id: "demo-04",
    name: "Kútik Malý Kapitán",
    category: "kutik",
    area: "Petržalka",
    lat: 48.1148,
    lng: 17.1093,
    ageMin: 0,
    ageMax: 5,
    indoor: true,
    score: 7.6,
    reviewCount: 15,
    price: { kind: "from", amount: 4 },
    hoursToday: "8:30 – 18:00",
    amenities: ["prebaľovací pult", "Montessori hračky"],
    verified: false,
    isDemo: true,
    source: "demo",
  },
  {
    id: "demo-05",
    name: "Lezecká herňa Výška",
    category: "herna",
    area: "Nové Mesto",
    lat: 48.1736,
    lng: 17.1264,
    ageMin: 5,
    ageMax: 15,
    indoor: true,
    score: 8.7,
    reviewCount: 63,
    price: { kind: "from", amount: 12 },
    hoursToday: "13:00 – 21:00",
    amenities: ["lezecká stena", "inštruktor", "oslavy"],
    verified: true,
    isDemo: true,
    source: "demo",
  },
  {
    id: "demo-07",
    name: "Kútik Kakao & Kocky",
    category: "kutik",
    area: "Rača",
    lat: 48.2047,
    lng: 17.1531,
    ageMin: 1,
    ageMax: 7,
    indoor: true,
    score: null,
    reviewCount: 0,
    price: { kind: "unknown" },
    hoursToday: null,
    amenities: ["kaviareň"],
    verified: false,
    isDemo: true,
    source: "demo",
  },
  {
    id: "demo-08",
    name: "Herňa Džungľa pri jazere",
    category: "herna",
    area: "Senec",
    lat: 48.2203,
    lng: 17.4006,
    ageMin: 2,
    ageMax: 12,
    indoor: true,
    score: 7.9,
    reviewCount: 51,
    price: { kind: "from", amount: 8 },
    hoursToday: "9:00 – 20:00",
    amenities: ["tobogán", "bistro", "parkovanie"],
    verified: true,
    isDemo: true,
    source: "demo",
  },
  {
    id: "demo-10",
    name: "Kútik Slniečko",
    category: "kutik",
    area: "Stupava",
    lat: 48.2741,
    lng: 17.0318,
    ageMin: 0,
    ageMax: 4,
    indoor: true,
    score: 9.4,
    reviewCount: 9,
    price: { kind: "from", amount: 3 },
    hoursToday: "9:00 – 17:00",
    amenities: ["prebaľovací pult", "záhrada", "kaviareň"],
    verified: true,
    isDemo: true,
    source: "demo",
  },
];

/**
 * Všetky miesta: DEMO kútiky a herne + skutočné ihriská z OSM.
 * DEMO ihriská boli odstránené, aby sa vymyslené ihrisko nemiešalo so skutočnými (DECISIONS.md, 2026-11-22).
 */
export const PLACES: Place[] = [
  ...DEMO_PLACES,
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
