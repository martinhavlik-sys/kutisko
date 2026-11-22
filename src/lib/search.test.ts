import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACES, REFERENCE_POINT } from "../data/places.ts";
import { amenityOptions, filterAndSort, formatDistance, matchesQuery, normalize, placesLabel, type Filters } from "./search.ts";

const base: Filters = { query: "", category: null, ageBand: null, sort: "recommended" };
const run = (f: Partial<Filters>) => filterAndSort(PLACES, { ...base, ...f }, REFERENCE_POINT);

test("všetky fixtures sú označené ako DEMO a skóre je 1–10", () => {
  assert.ok(PLACES.length >= 8 && PLACES.length <= 12);
  for (const p of PLACES) {
    assert.equal(p.isDemo, true);
    if (p.score !== null) assert.ok(p.score >= 1 && p.score <= 10);
  }
});

test("normalize odstráni diakritiku", () => {
  assert.equal(normalize("  Kútik Ružinov "), "kutik ruzinov");
});

test("vyhľadávanie bez diakritiky a podľa časti/vybavenia", () => {
  assert.ok(matchesQuery(PLACES[0], "mravenisko"));
  assert.equal(run({ query: "ruzinov" }).length, 1);
  assert.ok(run({ query: "kaviaren" }).length >= 3);
  assert.equal(run({ query: "neexistuje xyz" }).length, 0);
});

test("filter kategórie a veku", () => {
  assert.ok(run({ category: "ihrisko" }).every((p) => p.category === "ihrisko"));
  const toddlers = run({ ageBand: { min: 0, max: 2 } });
  assert.ok(toddlers.length > 0);
  assert.ok(toddlers.every((p) => p.ageMin <= 2));
  const older = run({ ageBand: { min: 10, max: 99 } });
  assert.ok(older.every((p) => p.ageMax >= 10));
  assert.ok(older.some((p) => p.ageMax === 10), "hraničný vek 10 sa započíta");
});

test("zoradenie podľa hodnotenia dáva miesta bez hodnotení na koniec", () => {
  const sorted = run({ sort: "rating" });
  assert.equal(sorted.at(-1)?.score, null);
  assert.ok(sorted[0].score! >= sorted[1].score!);
});

test("zoradenie podľa vzdialenosti", () => {
  const sorted = run({ sort: "distance" });
  assert.equal(sorted[0].area, "Staré Mesto");
});

test("formátovanie", () => {
  assert.equal(formatDistance(0.43), "430 m");
  assert.equal(formatDistance(2.25), "2,3 km");
  assert.equal(placesLabel(1), "1 miesto");
  assert.equal(placesLabel(3), "3 miesta");
  assert.equal(placesLabel(11), "11 miest");
});

test("rozšírené filtre: prostredie, vybavenie, overené, zadarmo", () => {
  assert.ok(run({ environment: "outdoor" }).every((p) => !p.indoor));
  assert.ok(run({ environment: "indoor" }).every((p) => p.indoor));
  const both = run({ amenities: ["kaviareň", "prebaľovací pult"] });
  assert.ok(both.length > 0 && both.every((p) => p.amenities.includes("kaviareň") && p.amenities.includes("prebaľovací pult")));
  assert.ok(run({ onlyVerified: true }).every((p) => p.verified));
  assert.ok(run({ onlyFree: true }).every((p) => p.price.kind === "free"));
  assert.equal(amenityOptions(PLACES)[0], "kaviareň");
});
