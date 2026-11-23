"use client";

import type { CategoryId } from "@/data/places";
import { createDemoStore, demoId } from "./demoStore";

/** DEMO komunitné zápisy — iba v tomto prehliadači. */

export type ModerationStatus = "pending" | "approved" | "rejected";

export interface DemoPhoto {
  /** Zmenšený náhľad ako data URL (JPEG). Opätovné zakódovanie odstráni EXIF/GPS. */
  dataUrl: string;
  status: ModerationStatus;
}

export interface MyReview {
  id: string;
  placeId: string;
  overall: number;
  cleanliness: number | null;
  creativity: number | null;
  text: string;
  photo: DemoPhoto | null;
  createdAt: string;
  /** Recenzie sa po základnej kontrole publikujú automaticky (manifest bod 10). */
  hidden: boolean;
}

export interface Suggestion {
  id: string;
  name: string;
  category: CategoryId;
  area: string;
  ageMin: number | null;
  ageMax: number | null;
  description: string;
  photo: DemoPhoto | null;
  createdAt: string;
  status: ModerationStatus;
  mine: boolean;
}

export interface Report {
  id: string;
  placeId: string;
  reason: string;
  note: string;
  createdAt: string;
  status: "open" | "resolved";
  mine: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  action: string;
}

const reviews = createDemoStore<MyReview[]>("kutisko.demo.reviews", []);
const suggestions = createDemoStore<Suggestion[]>("kutisko.demo.suggestions", []);
const reports = createDemoStore<Report[]>("kutisko.demo.reports", []);
const audit = createDemoStore<AuditEntry[]>("kutisko.demo.audit", []);

export const useMyReviews = reviews.useStore;
export const useSuggestions = suggestions.useStore;
export const useReports = reports.useStore;
export const useAudit = audit.useStore;

export function addAudit(action: string) {
  audit.write([{ id: demoId("a"), at: new Date().toISOString(), action }, ...audit.read()].slice(0, 50));
}

export function addReview(r: Omit<MyReview, "id" | "createdAt" | "hidden">) {
  // Jedno hodnotenie na miesto: nové nahradí predchádzajúce.
  const next: MyReview = { ...r, id: demoId("r"), createdAt: new Date().toISOString(), hidden: false };
  reviews.write([next, ...reviews.read().filter((x) => x.placeId !== r.placeId)]);
  return next;
}

export function addSuggestion(s: Omit<Suggestion, "id" | "createdAt" | "status" | "mine">) {
  const next: Suggestion = { ...s, id: demoId("s"), createdAt: new Date().toISOString(), status: "pending", mine: true };
  suggestions.write([next, ...suggestions.read()]);
  return next;
}

export function addReport(r: Pick<Report, "placeId" | "reason" | "note">) {
  const next: Report = { ...r, id: demoId("n"), createdAt: new Date().toISOString(), status: "open", mine: true };
  reports.write([next, ...reports.read()]);
  return next;
}

export function resetCommunityDemo() {
  reviews.write([]);
  suggestions.write([]);
  reports.write([]);
  audit.write([]);
}

export const writeReviews = reviews.write;
export const readReviews = reviews.read;
export const writeSuggestions = suggestions.write;
export const readSuggestions = suggestions.read;
export const writeReports = reports.write;
export const readReports = reports.read;

/** Zmenší obrázok na náhľad (max 640 px) a zakóduje ho do JPEG — tým sa zahodia EXIF/GPS metadáta. */
export async function makeDemoThumbnail(file: File, max = 640): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Vyberte obrázok (JPG, PNG alebo HEIC).");
  if (file.size > 15 * 1024 * 1024) throw new Error("Fotka je príliš veľká, najviac 15 MB.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.78);
}

const SEEDED_KEY = "kutisko.demo.adminSeeded";

/** Vymyslené položky, aby náhľad admin fronty nebol prázdny. Neoznačujú skutočné miesta ani osoby. */
export function seedAdminDemo() {
  try {
    if (window.localStorage.getItem(SEEDED_KEY)) return;
    window.localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    return;
  }
  const now = Date.now();
  const iso = (minAgo: number) => new Date(now - minAgo * 60000).toISOString();
  writeSuggestions([
    ...readSuggestions(),
    {
      id: "seed-s1",
      name: "Herňa Mravček (DEMO návrh)",
      category: "herna",
      area: "Dúbravka",
      ageMin: 2,
      ageMax: 8,
      description: "Ukážkový návrh od komunity: menšia herňa s kaviarňou.",
      photo: null,
      createdAt: iso(95),
      status: "pending",
      mine: false,
    },
    {
      id: "seed-s2",
      name: "Ihrisko pri potoku (DEMO návrh)",
      category: "ihrisko",
      area: "Lamač",
      ageMin: null,
      ageMax: null,
      description: "",
      photo: null,
      createdAt: iso(1440),
      status: "pending",
      mine: false,
    },
  ]);
  writeReports([
    ...readReports(),
    {
      id: "seed-n1",
      placeId: "web-eurovea-kutik",
      reason: "Iný problém",
      note: "Ukážkové nahlásenie (DEMO) na otestovanie admin fronty, nie skutočný podnet.",
      createdAt: iso(240),
      status: "open",
      mine: false,
    },
  ]);
}

export function resetAdminSeed() {
  try {
    window.localStorage.removeItem(SEEDED_KEY);
  } catch {
    /* nič */
  }
}
