import { REFERENCE_POINT } from "../data/places.ts";

/**
 * Výchozí bod pre vzdialenosť, keď poloha nie je k dispozícii (scenár S5).
 * Polohu nezisťujeme — rodič si mesto vyberie ručne. Súradnice sú približné
 * centrá obcí (verejne známe údaje), na odhad vzdialenosti v prototype stačia.
 */
export interface Origin {
  lat: number;
  lng: number;
  /** Genitív pre text „4,2 km od centra …“. */
  of: string;
  city: string;
}

export const CITY_ORIGINS: Origin[] = [
  { city: "Bratislava", of: "Bratislavy", lat: REFERENCE_POINT.lat, lng: REFERENCE_POINT.lng },
  { city: "Senec", of: "Senca", lat: 48.2196, lng: 17.4003 },
  { city: "Stupava", of: "Stupavy", lat: 48.2741, lng: 17.0317 },
  { city: "Šamorín", of: "Šamorína", lat: 48.0277, lng: 17.3089 },
  { city: "Pezinok", of: "Pezinka", lat: 48.2894, lng: 17.2667 },
  { city: "Malacky", of: "Malaciek", lat: 48.4361, lng: 17.0181 },
];

export function originFor(city: string | null): Origin {
  return CITY_ORIGINS.find((o) => o.city === city) ?? CITY_ORIGINS[0];
}
