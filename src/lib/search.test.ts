import { test } from "node:test";
import assert from "node:assert/strict";
import { CURATED_PLACES, PLACES, REFERENCE_POINT, type Place } from "../data/places.ts";
import { DEMO_PLACES } from "../data/demoFixtures.ts";
import { amenityOptions, filterAndSort, formatAge, formatDistance, matchesQuery, normalize, placesLabel, type Filters } from "./search.ts";

const base: Filters = { query: "", category: null, ageBand: null, sort: "recommended" };
/** Syntetické ihriská v tvare importu z OSM (testovacie, nie skutočné). */
const osmLike = (id: string, extra: Partial<Place>): Place => ({
  id, name: `Detské ihrisko ${id}`, category: "ihrisko", area: "Karlova Ves", lat: 48.155, lng: 17.06,
  ageMin: null, ageMax: null, indoor: false, score: null, reviewCount: 0, price: { kind: "free" },
  hoursToday: null, amenities: [], verified: false, isDemo: false, source: "osm", ...extra,
});
const FIXTURES: Place[] = [
  ...DEMO_PLACES,
  osmLike("t1", { amenities: ["pieskovisko", "šmykľavka"] }),
  osmLike("t2", { ageMin: 6, ageMax: 12, area: "Dúbravka", lat: 48.186, lng: 17.04 }),
];
const run = (f: Partial<Filters>) => filterAndSort(FIXTURES, { ...base, ...f }, REFERENCE_POINT);

test("DEMO fixtures sú označené ako DEMO a skóre je 1–10", () => {
  assert.ok(DEMO_PLACES.length >= 6 && DEMO_PLACES.length <= 12);
  for (const p of DEMO_PLACES) {
    assert.equal(p.isDemo, true);
    assert.equal(p.source, "demo");
    assert.notEqual(p.category, "ihrisko", "DEMO ihriská sa nemiešajú so skutočnými");
    if (p.score !== null) assert.ok(p.score >= 1 && p.score <= 10);
  }
});

test("skutočné ihriská z OSM: zdroj, kategória, poloha v pilotnej oblasti, unikátne id", () => {
  const osm = PLACES.filter((p) => p.source === "osm");
  const ids = new Set(PLACES.map((p) => p.id));
  assert.equal(ids.size, PLACES.length);
  for (const p of osm) {
    assert.equal(p.isDemo, false);
    assert.equal(p.category, "ihrisko");
    assert.equal(p.score, null, "OSM ihriská nemajú vymyslené hodnotenie");
    assert.ok(p.osm && p.id.startsWith("osm-"));
    assert.ok(p.lat > 47.9 && p.lat < 48.5 && p.lng > 16.8 && p.lng < 17.5, p.id);
    assert.ok(p.name.length > 0 && p.area.length > 0);
  }
});

test("herne a kútiky: skutočné, overené na webe prevádzky, bez vymyslených hodnotení", () => {
  assert.ok(CURATED_PLACES.length >= 8);
  assert.ok(!PLACES.some((p) => p.isDemo), "v aplikácii nie sú DEMO miesta");
  for (const p of CURATED_PLACES) {
    assert.equal(p.source, "web");
    assert.ok(p.id.startsWith("web-"));
    assert.ok(p.category === "kutik" || p.category === "herna");
    assert.equal(p.score, null);
    assert.equal(p.reviewCount, 0);
    assert.ok(p.indoor);
    assert.ok(p.web && p.web.sources.length > 0 && p.web.sources.every((u) => u.startsWith("https://")));
    assert.ok(p.web.website.startsWith("https://"));
    assert.ok(!p.web.sources.some((u) => /google\./.test(u)), "žiadne údaje z Google");
    assert.match(p.web.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(p.lat > 47.9 && p.lat < 48.5 && p.lng > 16.8 && p.lng < 17.5, p.id);
    if (p.ageMin !== null && p.ageMax !== null) assert.ok(p.ageMin <= p.ageMax);
  }
});

test("normalize odstráni diakritiku", () => {
  assert.equal(normalize("  Kútik Ružinov "), "kutik ruzinov");
});

test("vyhľadávanie bez diakritiky a podľa časti/vybavenia", () => {
  assert.ok(matchesQuery(DEMO_PLACES[0], "mravenisko"));
  assert.ok(PLACES.some((p) => matchesQuery(p, "eurovea")));
  assert.equal(run({ query: "ruzinov" }).length, 1);
  assert.ok(run({ query: "kaviaren" }).length >= 3);
  assert.equal(run({ query: "neexistuje xyz" }).length, 0);
});

test("filter kategórie a veku", () => {
  assert.ok(run({ category: "ihrisko" }).every((p) => p.category === "ihrisko"));
  const toddlers = run({ ageBand: { min: 0, max: 2 } });
  assert.ok(toddlers.length > 0);
  assert.ok(toddlers.every((p) => (p.ageMin ?? 0) <= 2));
  assert.ok(toddlers.some((p) => p.id === "t1"), "neuvedený vek nevylučuje");
  assert.ok(!toddlers.some((p) => p.id === "t2"));
  const older = run({ ageBand: { min: 10, max: 99 } });
  assert.ok(older.every((p) => (p.ageMax ?? 99) >= 10));
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
  assert.equal(formatAge(null, null), "neuvedený");
  assert.equal(formatAge(3, null), "od 3 r.");
  assert.equal(formatAge(2, 10), "2–10 r.");
});

test("rozšírené filtre: prostredie, vybavenie, overené, zadarmo", () => {
  assert.ok(run({ environment: "outdoor" }).every((p) => !p.indoor));
  assert.ok(run({ environment: "indoor" }).every((p) => p.indoor));
  const both = run({ amenities: ["kaviareň", "prebaľovací pult"] });
  assert.ok(both.length > 0 && both.every((p) => p.amenities.includes("kaviareň") && p.amenities.includes("prebaľovací pult")));
  assert.ok(run({ onlyVerified: true }).every((p) => p.verified));
  assert.ok(run({ onlyFree: true }).every((p) => p.price.kind === "free"));
  assert.equal(amenityOptions(DEMO_PLACES)[0], "kaviareň");
  assert.ok(run({ query: "piesk" }).some((p) => p.id === "t1"));
});

test("Odporúčané: skutočné miesta pred DEMO, potom podľa vzdialenosti", () => {
  const sorted = run({ sort: "recommended" });
  const firstDemo = sorted.findIndex((p) => p.isDemo);
  assert.ok(firstDemo > 0);
  assert.ok(sorted.slice(firstDemo).every((p) => p.isDemo));
});

test("mestské ihriská: zobrazia sa len po overení licencie, kandidáti majú platný tvar", async () => {
  const { CITY_REGISTER } = await import("../data/sources.ts");
  const city = (await import("../data/osm/city-playgrounds.json", { with: { type: "json" } })).default as { places: Place[] };
  assert.equal(PLACES.some((p) => p.source === "city"), CITY_REGISTER.approved);
  const ids = new Set(city.places.map((p) => p.id));
  assert.equal(ids.size, city.places.length);
  for (const p of city.places) {
    assert.equal(p.source, "city");
    assert.equal(p.verified, false);
    assert.equal(p.score, null);
    assert.ok(p.lat > 47.9 && p.lat < 48.5 && p.lng > 16.8 && p.lng < 17.5);
  }
});
