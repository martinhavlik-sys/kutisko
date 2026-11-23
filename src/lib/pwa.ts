"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Inštalácia aplikácie na plochu a správanie ako „natívna“ aplikácia
 * (hlavne Android: Chrome a Samsung Internet). Nič sa neodosiela na server.
 */

/** Udalosť `beforeinstallprompt` (Chrome, Edge, Samsung Internet); nie je v štandardných typoch. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallState =
  /** Server / ešte nevieme. */
  | "unknown"
  /** Už beží ako nainštalovaná aplikácia (z plochy). */
  | "installed"
  /** Prehliadač ponúka vlastné okno „Inštalovať“ (Android Chrome, Samsung Internet, desktop Chrome). */
  | "prompt"
  /** iPhone / iPad: inštalácia len ručne cez Zdieľať → Pridať na plochu. */
  | "ios"
  /** Android bez okna (napr. Firefox alebo prehliadač ho ešte neponúkol): návod cez menu prehliadača. */
  | "android-manual"
  /** Iné (desktop bez podpory) — kartu neukazujeme. */
  | "unsupported";

const listeners = new Set<() => void>();
let deferred: BeforeInstallPromptEvent | null = null;
let justInstalled = false;
let listening = false;

function emit() {
  listeners.forEach((l) => l());
}

/** Zachytiť okno inštalácie čo najskôr — udalosť príde raz, často skôr, než sa otvorí Profil. */
export function listenForInstallPrompt() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // nechceme automatický mini-banner; ponúkneme vlastné tlačidlo
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    justInstalled = true;
    emit();
  });
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS sa hlási ako Mac s dotykom.
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isSamsungInternet(): boolean {
  return typeof navigator !== "undefined" && /SamsungBrowser/i.test(navigator.userAgent);
}

function readState(): InstallState {
  if (justInstalled || isStandalone()) return "installed";
  if (deferred) return "prompt";
  if (isIOS()) return "ios";
  if (isAndroid()) return "android-manual";
  return "unsupported";
}

function subscribe(cb: () => void) {
  listenForInstallPrompt();
  listeners.add(cb);
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, readState, () => "unknown" as const);
}

/** Otvorí systémové okno inštalácie. Vráti `true`, ak ho používateľ potvrdil. */
export async function promptInstall(): Promise<boolean> {
  const e = deferred;
  if (!e) return false;
  deferred = null; // okno sa dá ukázať len raz
  emit();
  await e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === "accepted";
}

/**
 * Systémové tlačidlo / gesto Späť na Androide má zatvoriť otvorený dialóg,
 * nie odísť zo stránky.
 *
 * Chrome 120+ to pri `<dialog>` otvorenom cez `showModal()` robí sám (CloseWatcher).
 * Staršie prehliadače (napr. starší Samsung Internet) by však odišli zo stránky,
 * preto na Androide pri otvorení vložíme jeden záznam do histórie: Späť ho zoberie
 * a dialóg zavrie. Ak sa dialóg zavrie inak (krížik, Esc, CloseWatcher), záznam
 * odoberieme sami. Na iPhone sa nič nemení.
 */
export function useBackButtonClose(open: boolean, onClose: () => void): (after: () => void) => void {
  const onCloseRef = useRef(onClose);
  const pushedRef = useRef(false);
  const afterRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open || !isAndroid()) return;
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let poppedByBack = false;
    const onPop = () => {
      poppedByBack = true;
      onCloseRef.current();
    };
    // Odložené o jeden tik: React v dev režime spúšťa efekt dvakrát a `history.back()` je asynchrónne.
    const timer = window.setTimeout(() => {
      window.history.pushState({ ...(window.history.state ?? {}), kutiskoDialog: token }, "");
      pushedRef.current = true;
      window.addEventListener("popstate", onPop);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", onPop);
      const after = afterRef.current;
      afterRef.current = null;
      const ours = (window.history.state as { kutiskoDialog?: string } | null)?.kutiskoDialog === token;
      // Zatvorené krížikom / Esc / CloseWatcher: odobrať náš záznam, aby ďalšie Späť fungovalo normálne.
      // Ak medzitým prebehla navigácia na inú stránku, záznam už nie je navrchu — nechať tak.
      if (pushedRef.current && !poppedByBack && ours) {
        if (after) {
          // Zmena URL (napr. použitie filtrov) až keď je história späť v poriadku.
          window.addEventListener("popstate", () => window.setTimeout(after, 0), { once: true });
        }
        window.history.back();
      } else if (after) {
        after();
      }
      pushedRef.current = false;
    };
  }, [open]);

  /** Zavrie dialóg a `after` spustí až po upratanní histórie (bez Androidu hneď). */
  return useCallback((after: () => void) => {
    if (pushedRef.current) {
      afterRef.current = after;
      onCloseRef.current();
    } else {
      onCloseRef.current();
      after();
    }
  }, []);
}
