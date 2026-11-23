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
  /** Ak je poloha len približná, navigácia ide na adresu (presnejšie ako odhadnutý bod). */
  address?: string;
}

const coord = (n: number) => n.toFixed(6);

export function navigationUrl(provider: NavProvider, t: NavTarget): string {
  if (t.address) return addressUrl(provider, t.address);
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

function addressUrl(provider: NavProvider, address: string): string {
  switch (provider) {
    case "apple":
      return `https://maps.apple.com/?${new URLSearchParams({ daddr: address, dirflg: "d" }).toString()}`;
    case "google":
      return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: "1", destination: address, travelmode: "driving" }).toString()}`;
    case "waze":
      return `https://waze.com/ul?${new URLSearchParams({ q: address, navigate: "yes" }).toString()}`;
  }
}

/** Cieľ navigácie pre miesto: pri približnej polohe adresa, inak GPS. */
export function navTargetOf(p: { lat: number; lng: number; name: string; web?: { address: string; approxPosition: boolean } }): NavTarget {
  return { lat: p.lat, lng: p.lng, name: p.name, ...(p.web?.approxPosition ? { address: p.web.address } : {}) };
}

export const NAV_PROVIDERS: { id: NavProvider; label: string }[] = [
  { id: "apple", label: "Apple Mapy" },
  { id: "google", label: "Google Mapy" },
  { id: "waze", label: "Waze" },
];
