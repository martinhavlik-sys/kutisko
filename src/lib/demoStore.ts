"use client";

import { useSyncExternalStore } from "react";

/**
 * Jednoduché lokálne úložisko pre DEMO zápisy (localStorage + odber zmien).
 * Nič sa neodosiela na server (manifest bod 17).
 */
export function createDemoStore<T>(key: string, initial: T) {
  const listeners = new Set<() => void>();
  let cache: T | null = null;

  const read = (): T => {
    if (cache !== null) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      cache = initial;
    }
    return cache;
  };

  const write = (value: T) => {
    cache = value;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* súkromný režim alebo plné úložisko — ostane v pamäti */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };

  function useStore() {
    const value = useSyncExternalStore(subscribe, read, () => initial);
    return [value, (updater: (prev: T) => T) => write(updater(read()))] as const;
  }

  return { useStore, read, write };
}

export function demoId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
