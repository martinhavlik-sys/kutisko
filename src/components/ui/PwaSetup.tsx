"use client";

import { listenForInstallPrompt } from "@/lib/pwa";

// Spustí sa hneď pri načítaní skriptu, aby sme nezmeškali udalosť `beforeinstallprompt`
// (prehliadač ju pošle raz, často skôr, než používateľ otvorí Profil).
listenForInstallPrompt();

/** Nevykresľuje nič; len zaregistruje poslucháčov inštalácie v celej aplikácii. */
export function PwaSetup() {
  return null;
}
