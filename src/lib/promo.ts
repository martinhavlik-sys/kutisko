/**
 * UKÁŽKA monetizácie (nápad Martina 2026-11-23, zatiaľ nerozhodnuté): sponzorované miesto
 * a akcie prevádzok na najbližšie dni. Čistá logika bez prehliadača, aby sa dala testovať.
 * Pravidlá sú len návrh — pozri docs/MONETIZACIA.md.
 */
import type { AgeBand, CategoryId } from "../data/places.ts";

/** Vymyslená ukážková prevádzka. Nikdy nie skutočná herňa — nesmie sa dať pomýliť s pravdou. */
export interface PromoPlace {
  id: string;
  name: string;
  category: CategoryId;
  area: string;
  ageMin: number;
  ageMax: number;
  tagline: string;
}

export interface PromoEvent {
  id: string;
  /** Id ukážkovej prevádzky (PromoPlace). */
  placeId: string;
  title: string;
  /** Deň v tvare RRRR-MM-DD (čas Bratislavy). */
  date: string;
  /** „10:00“ alebo „10:00 – 12:00“; null = celý deň. */
  time: string | null;
  note: string | null;
  /** true = pridal ju používateľ v ukážkovom formulári (iba v tomto prehliadači). */
  addedByYou?: boolean;
}

/** Akcie sa ukazujú najviac na toľko dní dopredu („najbližší čas“). */
export const EVENT_WINDOW_DAYS = 14;
/** Najviac jedno sponzorované miesto nad zoznamom — reklama nesmie prevalcovať výsledky. */
export const MAX_SPONSORED = 1;

/** Dnešný dátum v Bratislave ako RRRR-MM-DD. */
export function bratislavaDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bratislava",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function toUtcDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Rozdiel v dňoch medzi dvoma dátumami RRRR-MM-DD (b − a). */
export function daysBetween(a: string, b: string): number {
  return toUtcDay(b) - toUtcDay(a);
}

export function addDays(iso: string, days: number): string {
  const t = new Date((toUtcDay(iso) + days) * 86_400_000);
  return t.toISOString().slice(0, 10);
}

/** Akcie od dneška do EVENT_WINDOW_DAYS dní, zoradené podľa dátumu a času. */
export function upcomingEvents(events: PromoEvent[], today: string, windowDays = EVENT_WINDOW_DAYS): PromoEvent[] {
  return events
    .filter((e) => {
      const d = daysBetween(today, e.date);
      return d >= 0 && d <= windowDays;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
}

const WEEKDAYS = ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"];
const MONTHS = ["jan", "feb", "mar", "apr", "máj", "jún", "júl", "aug", "sep", "okt", "nov", "dec"];

/** „Dnes“, „Zajtra“, inak „So 28. 11.“ */
export function eventDayLabel(date: string, today: string): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return "Dnes";
  if (diff === 1) return "Zajtra";
  const [y, m, d] = date.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[wd]} ${d}. ${m}.`;
}

export function monthShort(date: string): string {
  return MONTHS[Number(date.slice(5, 7)) - 1];
}

/**
 * Sponzorované miesto sa ukáže, len ak zodpovedá tomu, čo rodič práve hľadá
 * (kategória, vek, hľadaný text). Inak radšej nič.
 */
export function pickSponsored(
  promos: PromoPlace[],
  f: { category: CategoryId | null; ageBand: AgeBand | null; query: string },
): PromoPlace[] {
  const q = f.query.trim().toLocaleLowerCase("sk");
  return promos
    .filter((p) => (f.category ? p.category === f.category : true))
    .filter((p) => (f.ageBand ? p.ageMin <= f.ageBand.max && p.ageMax >= f.ageBand.min : true))
    .filter((p) => (q ? `${p.name} ${p.area} ${p.tagline}`.toLocaleLowerCase("sk").includes(q) : true))
    .slice(0, MAX_SPONSORED);
}

/* ---------- Ukážkový formulár „Pridať akciu“ ---------- */

export interface EventInput {
  title: string;
  date: string;
  time: string;
  note: string;
}

export type EventErrors = Partial<Record<keyof EventInput, string>>;

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d(\s*[–-]\s*([01]?\d|2[0-3]):[0-5]\d)?$/;

export function validateEvent(e: EventInput, today: string): EventErrors {
  const err: EventErrors = {};
  const title = e.title.trim();
  if (!title) err.title = "Napíšte názov akcie.";
  else if (title.length < 5) err.title = "Názov je príliš krátky, aspoň 5 znakov.";
  else if (title.length > 60) err.title = "Názov je príliš dlhý, najviac 60 znakov.";
  if (!e.date) err.date = "Vyberte deň akcie.";
  else {
    const d = daysBetween(today, e.date);
    if (Number.isNaN(d)) err.date = "Dátum nevyzerá správne.";
    else if (d < 0) err.date = "Akcia nemôže byť v minulosti.";
    else if (d > EVENT_WINDOW_DAYS) err.date = `Akcie sa pridávajú najviac ${EVENT_WINDOW_DAYS} dní dopredu.`;
  }
  if (e.time.trim() && !TIME_RE.test(e.time.trim())) err.time = "Čas napíšte ako 10:00 alebo 10:00 – 12:00.";
  if (e.note.trim().length > 120) err.note = "Popis je príliš dlhý, najviac 120 znakov.";
  return err;
}
