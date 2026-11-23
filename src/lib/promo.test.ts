import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, bratislavaDate, daysBetween, eventDayLabel, pickSponsored, upcomingEvents, validateEvent, MAX_SPONSORED } from "./promo.ts";
import { demoEvents, PROMO_PLACES } from "../data/promoDemo.ts";
import { AGE_BANDS } from "../data/places.ts";

test("dátumy: dnešok v Bratislave, posun a rozdiel dní", () => {
  // 23:30 UTC 23. 11. je v Bratislave už 24. 11.
  assert.equal(bratislavaDate(new Date("2026-11-23T23:30:00Z")), "2026-11-24");
  assert.equal(addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(daysBetween("2026-12-31", "2027-01-02"), 2);
});

test("akcie: len od dneška do 14 dní, zoradené", () => {
  const today = "2026-11-23";
  const ev = (id: string, date: string, time: string | null = null) => ({ id, placeId: "ukazka-herna", title: "x", date, time, note: null });
  const out = upcomingEvents([ev("b", "2026-11-25", "16:00"), ev("old", "2026-11-22"), ev("far", "2026-12-08"), ev("a", "2026-11-25", "09:00"), ev("t", today)], today);
  assert.deepEqual(out.map((e) => e.id), ["t", "a", "b"]);
});

test("ukážkové akcie sú vždy v najbližších dňoch a patria vymysleným prevádzkam", () => {
  const today = "2026-11-23";
  const all = demoEvents(today);
  assert.equal(upcomingEvents(all, today).length, all.length);
  for (const e of all) assert.ok(PROMO_PLACES.some((p) => p.id === e.placeId));
  for (const p of PROMO_PLACES) assert.match(p.name, /^Ukážkov/);
});

test("popis dňa: Dnes, Zajtra, deň v týždni", () => {
  assert.equal(eventDayLabel("2026-11-23", "2026-11-23"), "Dnes");
  assert.equal(eventDayLabel("2026-11-24", "2026-11-23"), "Zajtra");
  assert.equal(eventDayLabel("2026-11-28", "2026-11-23"), "So 28. 11.");
});

test("sponzorované: najviac jedno a len ak zodpovedá filtrom", () => {
  const none = { category: null, ageBand: null, query: "" };
  assert.equal(pickSponsored(PROMO_PLACES, none).length, MAX_SPONSORED);
  assert.equal(pickSponsored(PROMO_PLACES, { ...none, category: "ihrisko" }).length, 0);
  assert.equal(pickSponsored(PROMO_PLACES, { ...none, category: "kutik" })[0].id, "ukazka-kutik");
  const tenPlus = AGE_BANDS.find((b) => b.id === "10+")!;
  assert.equal(pickSponsored(PROMO_PLACES, { ...none, ageBand: tenPlus })[0]?.id, "ukazka-herna");
  assert.equal(pickSponsored(PROMO_PLACES, { ...none, query: "petržalka" }).length, 0);
});

test("formulár akcie: povinné polia, okno 14 dní, formát času", () => {
  const today = "2026-11-23";
  const ok = { title: "Maľovanie na tvár", date: "2026-11-25", time: "10:00 – 12:00", note: "" };
  assert.deepEqual(validateEvent(ok, today), {});
  assert.match(validateEvent({ ...ok, title: "ab" }, today).title!, /krátky/);
  assert.match(validateEvent({ ...ok, date: "2026-11-22" }, today).date!, /minulosti/);
  assert.match(validateEvent({ ...ok, date: "2026-12-08" }, today).date!, /14 dní/);
  assert.ok(validateEvent({ ...ok, date: "" }, today).date);
  assert.ok(validateEvent({ ...ok, time: "o desiatej" }, today).time);
  assert.deepEqual(validateEvent({ ...ok, time: "" }, today), {});
});
