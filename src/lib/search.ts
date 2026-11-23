import type { CategoryId, Place, Price } from "../data/places";

export type SortId = "recommended" | "distance" | "rating";

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "recommended", label: "Odporúčané" },
  { id: "distance", label: "Najbližšie" },
  { id: "rating", label: "Najlepšie hodnotené" },
];

export type Environment = "all" | "indoor" | "outdoor";

export interface Filters {
  query: string;
  category: CategoryId | null;
  ageBand: { min: number; max: number } | null;
  sort: SortId;
  environment?: Environment;
  amenities?: string[];
  onlyVerified?: boolean;
  onlyFree?: boolean;
  /** Okruh v km od výchozieho bodu (poloha alebo mesto); `null`/chýba = bez obmedzenia. */
  maxKm?: number | null;
}

const CATEGORY_KEYWORDS: Record<CategoryId, string> = {
  kutik: "kutik kutiky detsky detske",
  herna: "herna herne vnutorna vnutorne indoor",
  ihrisko: "ihrisko ihriska vonkajsie vonku outdoor",
};

/** Malé písmená bez diakritiky — „Kútik“ nájde aj „kutik“. */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase("sk")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function matchesQuery(place: Place, query: string): boolean {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = normalize(
    [place.name, place.area, place.amenities.join(" "), CATEGORY_KEYWORDS[place.category], place.source === "demo" ? "demo" : "skutocne"].join(" "),
  );
  return tokens.every((t) => haystack.includes(t));
}

/**
 * Prekrytie vekového rozsahu so zvolenou skupinou. Miesto s neuvedeným vekom sa nevylučuje
 * (neznámy údaj nesmie pôsobiť negatívne) — verejné ihriská sú spravidla pre všetky vekové skupiny.
 */
export function matchesAge(place: Place, band: Filters["ageBand"]): boolean {
  if (!band) return true;
  const min = place.ageMin ?? 0;
  const max = place.ageMax ?? 99;
  return min <= band.max && max >= band.min;
}

/** Vzdušná vzdialenosť v km (haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Jednoduché pracovné poradie „Odporúčané“ (váhy sú v manifeste otvorené):
 * skóre tlmené malým počtom hodnotení + malý bonus za overené údaje.
 * Miesto bez hodnotení nie je trestané nulou, dostane neutrálnu hodnotu.
 */
export function recommendedScore(place: Place): number {
  const prior = 7;
  const weight = 10;
  const base =
    place.score === null ? prior : (place.score * place.reviewCount + prior * weight) / (place.reviewCount + weight);
  return base + (place.verified ? 0.3 : 0);
}

export function filterAndSort(
  places: Place[],
  filters: Filters,
  origin: { lat: number; lng: number },
): Place[] {
  const result = places.filter(
    (p) =>
      (filters.category === null || p.category === filters.category) &&
      matchesAge(p, filters.ageBand) &&
      matchesQuery(p, filters.query) &&
      (!filters.environment || filters.environment === "all" || p.indoor === (filters.environment === "indoor")) &&
      (filters.amenities ?? []).every((a) => p.amenities.includes(a)) &&
      (!filters.onlyVerified || p.verified) &&
      (!filters.onlyFree || p.price.kind === "free") &&
      (filters.maxKm == null || distanceKm(origin, p) <= filters.maxKm),
  );

  const byDistance = (a: Place, b: Place) => distanceKm(origin, a) - distanceKm(origin, b);

  return result.sort((a, b) => {
    switch (filters.sort) {
      case "distance":
        return byDistance(a, b);
      case "rating": {
        if (a.score === null && b.score === null) return byDistance(a, b);
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score || b.reviewCount - a.reviewCount;
      }
      default:
        // Skutočné miesta majú prednosť pred vymyslenými DEMO miestami (rozhodnutie Martina 2026-11-22).
        return (
          Number(a.isDemo) - Number(b.isDemo) || recommendedScore(b) - recommendedScore(a) || byDistance(a, b)
        );
    }
  });
}

const nf1 = new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function formatScore(score: number): string {
  return nf1.format(score);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 100) * 10} m`;
  return `${nf1.format(km)} km`;
}

export function formatPrice(price: Price): string {
  switch (price.kind) {
    case "free":
      return "Zadarmo";
    case "from":
      return `od ${String(price.amount).replace(".", ",")} €`;
    case "purchase":
      return "Vstup pri konzumácii";
    default:
      return "Cena neoverená";
  }
}

/** ISO dátum → „22. 11. 2026“. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
}

export function formatAge(min: number | null, max: number | null): string {
  if (min === null && max === null) return "neuvedený";
  if (max === null) return `od ${min} r.`;
  if (min === null) return `do ${max} r.`;
  return `${min}–${max} r.`;
}

export function reviewsLabel(count: number): string {
  if (count === 1) return "1 hodnotenie";
  if (count >= 2 && count <= 4) return `${count} hodnotenia`;
  return `${count} hodnotení`;
}

export function placesLabel(count: number): string {
  if (count === 1) return "1 miesto";
  if (count >= 2 && count <= 4) return `${count} miesta`;
  return `${count} miest`;
}

/** Slovné vyjadrenie skóre 1–10 (pracovný návrh). */
export function scoreLabel(score: number): string {
  if (score >= 9) return "Vynikajúce";
  if (score >= 8) return "Veľmi dobré";
  if (score >= 7) return "Dobré";
  if (score >= 5) return "Priemerné";
  return "Slabšie";
}

/** Vybavenie zoradené podľa početnosti — ponuka pre filter. */
export function amenityOptions(places: Place[], limit = 10): string[] {
  const counts = new Map<string, number>();
  for (const p of places) for (const a of p.amenities) counts.set(a, (counts.get(a) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "sk"))
    .slice(0, limit)
    .map(([a]) => a);
}
