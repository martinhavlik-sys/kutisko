/**
 * „Otvorené teraz“ — čistá logika bez Reactu (testovateľná cez `node --test`).
 *
 * Rozumie len jednoznačným zápisom: týždenným hodinám overeným na webe prevádzky
 * („Po – Ne“, „Pi“, „Pracovné dni“, „Víkendy…“) a jednoduchým OSM zápisom („Mo-Su 08:00-20:00“, „24/7“).
 * Sezónne alebo nejasné zápisy vrátia null — radšej nič, ako nesprávne „Otvorené“.
 * Sviatky a prázdniny nepoznáme, preto sa počíta podľa bežného týždňa.
 */

import type { HoursRow } from "../data/places.ts";

/** Pre každý deň (0 = pondelok … 6 = nedeľa) intervaly v minútach od polnoci, alebo undefined = nevieme. */
export type WeekSchedule = ([number, number][] | undefined)[];

export interface OpenStatus {
  state: "open" | "closing" | "closed";
  /** Krátky stav: „Otvorené“, „Čoskoro zatvára“, „Zatvorené“, „Otvorené nonstop“. */
  label: string;
  /** Doplnok: „zatvára o 20:00“, „otvára zajtra o 9:00“… (prázdne pri nonstop). */
  detail: string;
}

const DAY_CODES: Record<string, number> = { po: 0, ut: 1, st: 2, št: 3, pi: 4, so: 5, ne: 6 };
const OSM_DAYS: Record<string, number> = { mo: 0, tu: 1, we: 2, th: 3, fr: 4, sa: 5, su: 6 };
const DAY_IN = ["v pondelok", "v utorok", "v stredu", "vo štvrtok", "v piatok", "v sobotu", "v nedeľu"];

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

function parseTimeRange(s: string): [number, number] | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const a = +m[1] * 60 + +m[2];
  let b = +m[3] * 60 + +m[4];
  if (b === 0) b = 24 * 60;
  return b > a ? [a, b] : null;
}

/** Slovenský popis dní z webu prevádzky → indexy dní, alebo null pri nejasnom zápise. */
export function parseDays(label: string): number[] | null {
  const l = label.toLowerCase().replace(/\(.*?\)/g, "").replace(/\s+a\s+sviatky.*$/, "").trim();
  if (/^pracovné dni/.test(l)) return range(0, 4);
  if (/^víkend/.test(l)) return [5, 6];
  const m = l.match(/^(po|ut|st|št|pi|so|ne)\s*(?:[–-]\s*(po|ut|st|št|pi|so|ne))?$/);
  if (!m) return null;
  const a = DAY_CODES[m[1]];
  const b = m[2] ? DAY_CODES[m[2]] : a;
  return b >= a ? range(a, b) : null;
}

export function parseWeek(rows: HoursRow[] | null | undefined): WeekSchedule | null {
  if (!rows || rows.length === 0) return null;
  const week: WeekSchedule = Array(7).fill(undefined);
  let any = false;
  for (const r of rows) {
    const days = parseDays(r.days);
    const t = parseTimeRange(r.hours);
    if (!days || !t) continue;
    for (const d of days) week[d] = [...(week[d] ?? []), t];
    any = true;
  }
  return any ? week : null;
}

/** Len jednoduché OSM zápisy: „24/7“ alebo „Mo-Su 08:00-20:00; Sa 09:00-12:00“. Sezónne (mesiace) → null. */
export function parseOsmHours(s: string | null | undefined): WeekSchedule | null {
  if (!s) return null;
  const v = s.trim();
  if (v === "24/7") return Array.from({ length: 7 }, () => [[0, 24 * 60]] as [number, number][]);
  const week: WeekSchedule = Array(7).fill(undefined);
  for (const part of v.split(";")) {
    const m = part.trim().match(/^(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+(\d{2}:\d{2}-\d{2}:\d{2})$/);
    if (!m) return null;
    const a = OSM_DAYS[m[1].toLowerCase()];
    const b = m[2] ? OSM_DAYS[m[2].toLowerCase()] : a;
    const t = parseTimeRange(m[3]);
    if (b < a || !t) return null;
    for (const d of range(a, b)) week[d] = [...(week[d] ?? []), t];
  }
  return week;
}

/** Deň (0 = pondelok) a minúty v Bratislave pre daný okamih. */
export function bratislavaTime(date: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bratislava",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  return { day, minutes: +get("hour") * 60 + +get("minute") };
}

export const formatMinutes = (m: number) => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, "0")}`;

/** Stav otvorenia; null, ak dnešné hodiny nepoznáme. */
export function openStatus(week: WeekSchedule | null, now: { day: number; minutes: number }): OpenStatus | null {
  if (!week) return null;
  const today = week[now.day];
  if (today === undefined) return null;
  if (week.every((d) => d?.some(([a, b]) => a === 0 && b === 24 * 60))) {
    return { state: "open", label: "Otvorené nonstop", detail: "" };
  }
  const current = today.find(([a, b]) => now.minutes >= a && now.minutes < b);
  if (current) {
    const left = current[1] - now.minutes;
    return left <= 60
      ? { state: "closing", label: "Čoskoro zatvára", detail: `o ${formatMinutes(current[1])}` }
      : { state: "open", label: "Otvorené", detail: `zatvára o ${formatMinutes(current[1])}` };
  }
  const laterToday = today.filter(([a]) => a > now.minutes).sort((x, y) => x[0] - y[0])[0];
  if (laterToday) return { state: "closed", label: "Zatvorené", detail: `otvára o ${formatMinutes(laterToday[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (now.day + i) % 7;
    const slots = week[d];
    if (slots === undefined) return { state: "closed", label: "Zatvorené", detail: "" };
    if (slots.length > 0) {
      const first = Math.min(...slots.map(([a]) => a));
      return { state: "closed", label: "Zatvorené", detail: `otvára ${i === 1 ? "zajtra" : DAY_IN[d]} o ${formatMinutes(first)}` };
    }
  }
  return { state: "closed", label: "Zatvorené", detail: "" };
}

/** Index dnešného riadka v týždenných hodinách (na zvýraznenie), alebo -1. */
export function todayRowIndex(rows: HoursRow[] | null | undefined, day: number): number {
  if (!rows) return -1;
  return rows.findIndex((r) => parseDays(r.days)?.includes(day));
}
