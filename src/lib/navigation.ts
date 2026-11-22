/**
 * Odkazy na externú navigáciu (manifest, „UX navigácia“).
 * Používame oficiálne univerzálne webové URL: ak je aplikácia nainštalovaná,
 * systém ju zvyčajne otvorí, inak sa otvorí webová verzia (fallback).
 * Poloha používateľa sa nepoužíva; štart určí externá služba.
 */
export type NavProvider = "apple" | "google" | "waze";

export interface NavTarget {
  lat: number;
  lng: number;
  name: string;
}

const coord = (n: number) => n.toFixed(6);

export function navigationUrl(provider: NavProvider, t: NavTarget): string {
  const ll = `${coord(t.lat)},${coord(t.lng)}`;
  switch (provider) {
    case "apple": {
      const q = new URLSearchParams({ daddr: ll, q: t.name, dirflg: "d" });
      return `https://maps.apple.com/?${q.toString()}`;
    }
    case "google": {
      const q = new URLSearchParams({ api: "1", destination: ll, travelmode: "driving" });
      return `https://www.google.com/maps/dir/?${q.toString()}`;
    }
    case "waze": {
      const q = new URLSearchParams({ ll, navigate: "yes" });
      return `https://waze.com/ul?${q.toString()}`;
    }
  }
}

export const NAV_PROVIDERS: { id: NavProvider; label: string }[] = [
  { id: "apple", label: "Apple Mapy" },
  { id: "google", label: "Google Mapy" },
  { id: "waze", label: "Waze" },
];
