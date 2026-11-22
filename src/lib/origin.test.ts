import { test } from "node:test";
import assert from "node:assert/strict";
import { CITY_ORIGINS, originFor } from "./origin.ts";
import { PLACES } from "../data/places.ts";
import { distanceKm, filterAndSort } from "./search.ts";

test("výchozí bod: bez výberu centrum Bratislavy, neznáme mesto tiež", () => {
  assert.equal(originFor(null).city, "Bratislava");
  assert.equal(originFor("Neexistuje").city, "Bratislava");
  assert.equal(originFor("Senec").of, "Senca");
});

test("zoradenie Najbližšie sa riadi vybraným mestom", () => {
  const f = { query: "", category: null, ageBand: null, sort: "distance" as const };
  for (const o of CITY_ORIGINS) {
    const r = filterAndSort(PLACES, f, o);
    for (let i = 1; i < r.length; i++) assert.ok(distanceKm(o, r[i - 1]) <= distanceKm(o, r[i]));
  }
  const ba = filterAndSort(PLACES, f, originFor(null))[0].id;
  const senec = filterAndSort(PLACES, f, originFor("Senec"))[0].id;
  assert.notEqual(ba, senec);
});
