import { test } from "node:test";
import assert from "node:assert/strict";
import { bratislavaTime, openStatus, parseDays, parseOsmHours, parseWeek, todayRowIndex } from "./openingHours.ts";

const at = (day: number, h: number, m = 0) => ({ day, minutes: h * 60 + m });

test("hodiny: popisy dní z webov prevádzok", () => {
  assert.deepEqual(parseDays("Po – Ne"), [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(parseDays("Po – Št"), [0, 1, 2, 3]);
  assert.deepEqual(parseDays("Pi"), [4]);
  assert.deepEqual(parseDays("So – Ne a sviatky"), [5, 6]);
  assert.deepEqual(parseDays("Po – Ne (otváracie hodiny centra)"), [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(parseDays("Pracovné dni"), [0, 1, 2, 3, 4]);
  assert.deepEqual(parseDays("Víkendy, sviatky a prázdniny"), [5, 6]);
  assert.equal(parseDays("Podľa sezóny"), null);
});

test("hodiny: otvorené, čoskoro zatvára, zatvorené", () => {
  const w = parseWeek([{ days: "Po – Ne", hours: "9:00 – 19:00" }]);
  assert.deepEqual(openStatus(w, at(2, 12)), { state: "open", label: "Otvorené", detail: "zatvára o 19:00" });
  assert.deepEqual(openStatus(w, at(2, 18, 15)), { state: "closing", label: "Čoskoro zatvára", detail: "o 19:00" });
  assert.deepEqual(openStatus(w, at(2, 7)), { state: "closed", label: "Zatvorené", detail: "otvára o 9:00" });
  assert.deepEqual(openStatus(w, at(2, 19)), { state: "closed", label: "Zatvorené", detail: "otvára zajtra o 9:00" });
});

test("hodiny: rôzne dni v týždni", () => {
  const w = parseWeek([
    { days: "Pracovné dni", hours: "14:00 – 20:00" },
    { days: "Víkendy, sviatky a prázdniny", hours: "9:00 – 20:00" },
  ]);
  assert.equal(openStatus(w, at(0, 10))?.detail, "otvára o 14:00");
  assert.equal(openStatus(w, at(4, 21))?.detail, "otvára zajtra o 9:00");
  assert.equal(openStatus(w, at(5, 10))?.state, "open");
});

test("hodiny: nejasné alebo chýbajúce údaje → bez stavu", () => {
  assert.equal(openStatus(parseWeek(null), at(0, 10)), null);
  assert.equal(openStatus(parseWeek([{ days: "Po – Pi", hours: "9:00 – 17:00" }]), at(6, 10)), null, "nedeľu nepoznáme");
  assert.equal(parseOsmHours("Apr-Oct Mo-Su 08:00-18:00; May-Aug Mo-Su 08:00-20:00"), null);
});

test("hodiny: jednoduché zápisy z OpenStreetMap", () => {
  assert.equal(openStatus(parseOsmHours("24/7"), at(3, 3))?.label, "Otvorené nonstop");
  assert.equal(openStatus(parseOsmHours("Mo-Su 08:00-20:00"), at(3, 21))?.detail, "otvára zajtra o 8:00");
  assert.equal(openStatus(parseOsmHours("Mo-Fr 09:00-21:00"), at(5, 10)), null);
});

test("hodiny: čas v Bratislave a dnešný riadok", () => {
  // 2026-11-23 je pondelok; 14:30 UTC = 15:30 v Bratislave (zimný čas)
  assert.deepEqual(bratislavaTime(new Date("2026-11-23T14:30:00Z")), { day: 0, minutes: 15 * 60 + 30 });
  const rows = [{ days: "Po – Št", hours: "11:00 – 20:00" }, { days: "Pi", hours: "11:00 – 21:00" }];
  assert.equal(todayRowIndex(rows, 4), 1);
  assert.equal(todayRowIndex(rows, 6), -1);
});
