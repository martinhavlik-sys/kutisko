import { REFERENCE_POINT } from "../data/places.ts";
import { distanceKm } from "./search.ts";

/**
 * Bod, od ktorého počítame vzdialenosť a zoradenie „Najbližšie“.
 * - `gps`: poloha rodiča (iba ak ju sám zapol a je v pilotnej oblasti),
 * - `city`: ručne vybrané mesto, inak centrum Bratislavy (záloha pri zamietnutej polohe, scenár S5).
 * Súradnice miest sú približné centrá obcí (verejne známe údaje).
 */
export interface Origin {
  kind: "gps" | "city";
  lat: number;
  lng: number;
  /** Genitív pre text „4,2 km od centra …“. */
  of: string;
  city: string;
  /** Krátky text za vzdialenosťou na karte: „od vás“, „od centra“, „od Senca“. */
  from: string;
}

function cityOrigin(city: string, of: string, lat: number, lng: number): Origin {
  return { kind: "city", city, of, lat, lng, from: city === "Bratislava" ? "od centra" : `od ${of}` };
}

export const CITY_ORIGINS: Origin[] = [
  cityOrigin("Bratislava", "Bratislavy", REFERENCE_POINT.lat, REFERENCE_POINT.lng),
  cityOrigin("Senec", "Senca", 48.2196, 17.4003),
  cityOrigin("Stupava", "Stupavy", 48.2741, 17.0317),
  cityOrigin("Šamorín", "Šamorína", 48.0277, 17.3089),
  cityOrigin("Pezinok", "Pezinka", 48.2894, 17.2667),
  cityOrigin("Malacky", "Malaciek", 48.4361, 17.0181),
];

export function originFor(city: string | null): Origin {
  return CITY_ORIGINS.find((o) => o.city === city) ?? CITY_ORIGINS[0];
}

/** Pilot: Bratislava a okolie. Poloha ďalej od centra sa nepoužije (vzdialenosti by nedávali zmysel). */
export const PILOT_RADIUS_KM = 60;

export function isInPilotArea(p: { lat: number; lng: number }): boolean {
  return distanceKm(REFERENCE_POINT, p) <= PILOT_RADIUS_KM;
}

export function gpsOrigin(p: { lat: number; lng: number }): Origin {
  return { kind: "gps", city: "Moja poloha", of: "vašej polohy", from: "od vás", lat: p.lat, lng: p.lng };
}

/** Výsledný bod: poloha (ak je k dispozícii a v pilotnej oblasti), inak mesto. */
export function resolveOrigin(gps: { lat: number; lng: number } | null, city: string | null): Origin {
  return gps && isInPilotArea(gps) ? gpsOrigin(gps) : originFor(city);
}

/** Okruh vyhľadávania v km; `null` = bez obmedzenia. */
export const RADIUS_OPTIONS = [1, 3, 5, 10, 25] as const;

export function radiusLabel(km: number | null): string {
  return km === null ? "Bez obmedzenia" : `do ${km} km`;
}
