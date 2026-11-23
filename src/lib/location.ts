"use client";

import { useSyncExternalStore } from "react";
import { isInPilotArea } from "./origin";

/**
 * Poloha používateľa (lokalizačné služby) — iba na vyžiadanie a iba v zariadení.
 *
 * GDPR: súradnice držíme len v pamäti otvorenej stránky. Neukladajú sa do localStorage,
 * neposielajú sa na server ani do analytiky. Po zatvorení aplikácie zmiznú.
 * Do prehliadača si pamätáme jediný príznak „rodič polohu zapol“, aby sme pri ďalšom
 * otvorení polohu znova zistili bez otázky — ale len ak to systém už povolil.
 */

export type LocationStatus =
  | "off" // rodič polohu nezapol
  | "locating" // zisťujem
  | "on" // máme polohu
  | "denied" // rodič alebo systém prístup zamietol
  | "unavailable" // prehliadač polohu nepodporuje alebo nie je HTTPS
  | "error" // časový limit / signál
  | "outside"; // poloha je mimo pilotnej oblasti

export interface LocationState {
  status: LocationStatus;
  coords: { lat: number; lng: number; accuracy: number } | null;
  /** Čas zistenia (ms) — na obnovenie po návrate do aplikácie. */
  at: number | null;
}

const STALE_MS = 2 * 60 * 1000;
const FLAG_KEY = "kutisko.location.enabled";

const OFF: LocationState = { status: "off", coords: null, at: null };
let state: LocationState = OFF;
const listeners = new Set<() => void>();
let inflight = false;

function emit(next: LocationState) {
  state = next;
  listeners.forEach((l) => l());
}

function setFlag(on: boolean) {
  try {
    if (on) window.localStorage.setItem(FLAG_KEY, "1");
    else window.localStorage.removeItem(FLAG_KEY);
  } catch {
    /* súkromný režim — nevadí */
  }
}

function getFlag(): boolean {
  try {
    return window.localStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator && window.isSecureContext !== false;
}

function classify(coords: { lat: number; lng: number }): "on" | "outside" {
  return isInPilotArea(coords) ? "on" : "outside";
}

/** Zistí polohu raz (nie nepretržité sledovanie — šetrí batériu). Vráti výsledný stav. */
export function requestLocation(): Promise<LocationStatus> {
  if (!isGeolocationSupported()) {
    emit({ status: "unavailable", coords: null, at: null });
    return Promise.resolve("unavailable");
  }
  if (inflight) return Promise.resolve("locating");
  inflight = true;
  // Pri obnove ponecháme starú polohu viditeľnú, kým nepríde nová.
  if (state.status !== "on") emit({ ...state, status: "locating" });
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        inflight = false;
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        const status = classify(coords);
        setFlag(true);
        emit({ status, coords, at: Date.now() });
        resolve(status);
      },
      (err) => {
        inflight = false;
        const status: LocationStatus = err.code === err.PERMISSION_DENIED ? "denied" : "error";
        if (status === "denied") setFlag(false);
        // Pri chybe obnovy si necháme poslednú známu polohu.
        if (status === "error" && state.coords) emit({ ...state, status: classify(state.coords) });
        else emit({ status, coords: null, at: null });
        resolve(status);
      },
      // Na vzdialenosť v km stačí bežná presnosť; je rýchlejšia a šetrí batériu.
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  });
}

/** Vypnúť: zabudnúť polohu aj príznak. */
export function disableLocation() {
  setFlag(false);
  emit(OFF);
}

let initialized = false;

/**
 * Pri otvorení aplikácie: ak rodič polohu už predtým zapol a systém ju stále povoľuje,
 * zistíme ju potichu. Nikdy sa nepýtame sami od seba. Po návrate do aplikácie polohu obnovíme.
 */
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  if (getFlag() && isGeolocationSupported()) {
    const perms = navigator.permissions;
    if (perms?.query) {
      perms
        .query({ name: "geolocation" as PermissionName })
        .then((p) => {
          if (p.state === "granted") void requestLocation();
          else if (p.state === "denied") setFlag(false);
        })
        .catch(() => {});
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (state.coords && state.at && Date.now() - state.at > STALE_MS) void requestLocation();
  });
}

function subscribe(cb: () => void) {
  init();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLocation(): LocationState {
  return useSyncExternalStore(subscribe, () => state, () => OFF);
}
