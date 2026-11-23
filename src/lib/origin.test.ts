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

test("poloha: v pilotnej oblasti sa použije, mimo nej záloha na mesto", async () => {
  const { resolveOrigin, isInPilotArea } = await import("./origin.ts");
  const petrzalka = { lat: 48.1105, lng: 17.1086 };
  const kosice = { lat: 48.7164, lng: 21.2611 };
  assert.ok(isInPilotArea(petrzalka));
  assert.ok(!isInPilotArea(kosice));
  const o = resolveOrigin(petrzalka, "Senec");
  assert.equal(o.kind, "gps");
  assert.equal(o.from, "od vás");
  assert.equal(resolveOrigin(kosice, "Senec").city, "Senec");
  assert.equal(resolveOrigin(null, null).city, "Bratislava");
  assert.equal(originFor(null).from, "od centra");
  assert.equal(originFor("Senec").from, "od Senca");
});

test("okruh v km: vylúči vzdialenejšie miesta, null = bez obmedzenia", async () => {
  const { gpsOrigin, RADIUS_OPTIONS } = await import("./origin.ts");
  const me = gpsOrigin({ lat: 48.1435, lng: 17.1088 });
  const base = { query: "", category: null, ageBand: null, sort: "distance" as const };
  const all = filterAndSort(PLACES, { ...base, maxKm: null }, me);
  assert.equal(all.length, PLACES.length);
  let prev = 0;
  for (const km of RADIUS_OPTIONS) {
    const r = filterAndSort(PLACES, { ...base, maxKm: km }, me);
    assert.ok(r.every((p) => distanceKm(me, p) <= km));
    assert.ok(r.length >= prev, "väčší okruh nikdy nevráti menej miest");
    prev = r.length;
  }
  assert.ok(filterAndSort(PLACES, { ...base, maxKm: 1 }, me).length > 0, "v centre je do 1 km aspoň jedno ihrisko");
});
