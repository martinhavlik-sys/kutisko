"use client";

import { useSyncExternalStore } from "react";
import { originFor } from "./origin";

/** Voliteľné preferencie (manifest bod 8) — iba lokálne v prehliadači, DEMO. */
export interface Preferences {
  ageId: string | null;
  city: string | null;
  maxDistanceKm: number | null;
}

export const EMPTY_PREFERENCES: Preferences = { ageId: null, city: null, maxDistanceKm: null };

/** Ručný výber lokality (pri zamietnutej geolokácii). Pilot: Bratislava a okolie. */
export const CITIES = ["Bratislava", "Senec", "Stupava", "Šamorín", "Pezinok", "Malacky"];
export const DISTANCES = [5, 10, 25, 50];

const KEY = "kutisko.demo.preferences";
const listeners = new Set<() => void>();
let cache: Preferences | null = null;

function read(): Preferences {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) } : EMPTY_PREFERENCES;
  } catch {
    cache = EMPTY_PREFERENCES;
  }
  return cache;
}

function write(p: Preferences) {
  cache = p;
  try {
    if (p.ageId === null && p.city === null && p.maxDistanceKm === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ostane len v pamäti */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePreferences() {
  const prefs = useSyncExternalStore(subscribe, read, () => EMPTY_PREFERENCES);
  return {
    prefs,
    set: (patch: Partial<Preferences>) => write({ ...read(), ...patch }),
    clear: () => write(EMPTY_PREFERENCES),
    isEmpty: prefs.ageId === null && prefs.city === null && prefs.maxDistanceKm === null,
  };
}

/** Bod, od ktorého sa počíta vzdialenosť: ručne vybrané mesto, inak centrum Bratislavy. */
export function useOrigin() {
  return originFor(usePreferences().prefs.city);
}
