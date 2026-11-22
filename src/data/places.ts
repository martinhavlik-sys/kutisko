/**
 * SYNTETICKÉ DEMO DÁTA — nie sú to skutočné prevádzky.
 *
 * Názvy, hodnotenia, ceny, hodiny aj vybavenie sú vymyslené pre účely
 * prototypu (PRODUCT_MANIFESTO.md, body 15–17). Súradnice ležia len približne
 * v uvedených mestských častiach / obciach Bratislavy a okolia, aby mapa
 * a vzdialenosti pôsobili realisticky. Nepoužívať ako zdroj informácií.
 */

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
  ageMin: number;
  ageMax: number;
  /** Celkové skóre 1–10 (priemer rodičovských hodnotení) alebo null, ak hodnotenia chýbajú. */
  score: number | null;
  reviewCount: number;
  price: Price;
  /** Text dnešných hodín, alebo null = neoverené (nesmie sa tváriť ako „zatvorené“). */
  hoursToday: string | null;
  amenities: string[];
  /** Údaje overil kurátor KUTISKO (simulované). */
  verified: boolean;
  isDemo: true;
}

export const PLACES: Place[] = [
  {
    id: "demo-01",
    name: "Kútik Mravenisko",
    category: "kutik",
    area: "Staré Mesto",
    lat: 48.1452,
    lng: 17.1125,
    ageMin: 1,
    ageMax: 6,
    score: 8.9,
    reviewCount: 42,
    price: { kind: "from", amount: 5 },
    hoursToday: "9:00 – 19:00",
    amenities: ["kaviareň", "prebaľovací pult", "detské menu"],
    verified: true,
    isDemo: true,
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
    score: 9.2,
    reviewCount: 118,
    price: { kind: "from", amount: 9 },
    hoursToday: "10:00 – 20:00",
    amenities: ["trampolíny", "oslavy", "kaviareň", "parkovanie"],
    verified: true,
    isDemo: true,
  },
  {
    id: "demo-03",
    name: "Ihrisko Pod Lipami",
    category: "ihrisko",
    area: "Karlova Ves",
    lat: 48.1561,
    lng: 17.0598,
    ageMin: 2,
    ageMax: 10,
    score: 8.1,
    reviewCount: 27,
    price: { kind: "free" },
    hoursToday: null,
    amenities: ["pieskovisko", "tieň", "lavičky"],
    verified: true,
    isDemo: true,
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
    score: 7.6,
    reviewCount: 15,
    price: { kind: "from", amount: 4 },
    hoursToday: "8:30 – 18:00",
    amenities: ["prebaľovací pult", "Montessori hračky"],
    verified: false,
    isDemo: true,
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
    score: 8.7,
    reviewCount: 63,
    price: { kind: "from", amount: 12 },
    hoursToday: "13:00 – 21:00",
    amenities: ["lezecká stena", "inštruktor", "oslavy"],
    verified: true,
    isDemo: true,
  },
  {
    id: "demo-06",
    name: "Ihrisko Lesná čistinka",
    category: "ihrisko",
    area: "Dúbravka",
    lat: 48.1862,
    lng: 17.0412,
    ageMin: 3,
    ageMax: 12,
    score: 9.0,
    reviewCount: 38,
    price: { kind: "free" },
    hoursToday: null,
    amenities: ["lanová dráha", "tieň", "pitná voda"],
    verified: false,
    isDemo: true,
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
    score: null,
    reviewCount: 0,
    price: { kind: "unknown" },
    hoursToday: null,
    amenities: ["kaviareň"],
    verified: false,
    isDemo: true,
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
    score: 7.9,
    reviewCount: 51,
    price: { kind: "from", amount: 8 },
    hoursToday: "9:00 – 20:00",
    amenities: ["tobogán", "bistro", "parkovanie"],
    verified: true,
    isDemo: true,
  },
  {
    id: "demo-09",
    name: "Ihrisko Na hrádzi",
    category: "ihrisko",
    area: "Šamorín",
    lat: 48.0297,
    lng: 17.3088,
    ageMin: 1,
    ageMax: 10,
    score: 8.4,
    reviewCount: 12,
    price: { kind: "free" },
    hoursToday: null,
    amenities: ["pieskovisko", "hojdačky", "cyklotrasa"],
    verified: false,
    isDemo: true,
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
    score: 9.4,
    reviewCount: 9,
    price: { kind: "from", amount: 3 },
    hoursToday: "9:00 – 17:00",
    amenities: ["prebaľovací pult", "záhrada", "kaviareň"],
    verified: true,
    isDemo: true,
  },
  {
    id: "demo-11",
    name: "Ihrisko Vodný svet",
    category: "ihrisko",
    area: "Vrakuňa",
    lat: 48.1312,
    lng: 17.1987,
    ageMin: 2,
    ageMax: 8,
    score: 7.2,
    reviewCount: 21,
    price: { kind: "free" },
    hoursToday: "9:00 – 20:00",
    amenities: ["vodné prvky", "lavičky", "toalety"],
    verified: true,
    isDemo: true,
  },
];

/** Referenčný bod pre vzdialenosť v prototype (centrum Bratislavy). Poloha používateľa sa nezisťuje. */
export const REFERENCE_POINT = { lat: 48.1435, lng: 17.1088, label: "centra" } as const;
