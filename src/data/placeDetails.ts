/**
 * Detail miesta. Vymyslené DEMO popisy a recenzie boli odstránené spolu s DEMO miestami
 * (DECISIONS.md, 2026-11-22). Skutočné miesta nemajú žiadne vymyslené hodnotenia ani recenzie.
 */

import type { Place } from "./places";

export interface Criteria {
  /** Čistota priestoru 1–10 */
  cleanliness: number;
  /** Kreativita priestoru 1–10 */
  creativity: number;
  /** Celkový dojem 1–10 */
  overall: number;
}

export interface DemoReview {
  author: string;
  score: number;
  text: string;
  when: string;
}

export interface PlaceDetail {
  description: string;
  /** Týždenné hodiny, null = neoverené. */
  hoursWeek: { days: string; hours: string }[] | null;
  criteria: Criteria | null;
  reviews: DemoReview[];
}

/**
 * Detail miesta: herne a kútiky majú vlastný opis kurátora (fakty z webu prevádzky),
 * skutočné ihriská z OSM dostanú vecný opis odvodený z dostupných údajov.
 * Nikde nie sú vymyslené recenzie či hodnotenia.
 */
export function getPlaceDetail(place: Place): PlaceDetail | null {
  if (place.source === "demo") return null;
  if (place.web) return { description: place.web.description, hoursWeek: place.web.hoursWeek, criteria: null, reviews: [] };
  const parts = [`Verejné detské ihrisko v lokalite ${place.area}.`];
  if (place.source === "city") parts.push("Ihrisko eviduje mesto v registri športovísk; vybavenie zatiaľ nepoznáme.");
  else if (place.amenities.length > 0) parts.push(`Podľa OpenStreetMap tu nájdete: ${place.amenities.join(", ")}.`);
  else parts.push("Vybavenie ihriska zatiaľ v OpenStreetMap nie je zapísané.");
  parts.push("Údaje zatiaľ neoveril kurátor KUTISKO ani rodičia.");
  return { description: parts.join(" "), hoursWeek: null, criteria: null, reviews: [] };
}
