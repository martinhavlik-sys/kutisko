"use client";

import { useSyncExternalStore } from "react";

/**
 * Obľúbené miesta — iba lokálne v prehliadači (localStorage), DEMO.
 * Nič sa neodosiela na server.
 */
const KEY = "kutisko.demo.saved";
const listeners = new Set<() => void>();
let cache: string[] | null = null;
const EMPTY: string[] = [];

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* súkromný režim — ostane len v pamäti */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSaved() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = (id: string): boolean => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    write(next);
    return next.includes(id);
  };
  return { ids, has: (id: string) => ids.includes(id), toggle };
}
