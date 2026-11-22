import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlaces, cleanAreaName, displayName, isPublic, parseAge, pickArea, makePolygon } from "./transform.mjs";

// Syntetické prvky v tvare odpovede Overpass (nie skutočné OSM objekty).
const square = (lat, lon, d) => [
  { lat, lon }, { lat, lon: lon + d }, { lat: lat + d, lon: lon + d }, { lat: lat + d, lon }, { lat, lon },
];
const admin = (id, level, name, lat, lon, d) => ({
  type: "relation", id, tags: { admin_level: level, name, boundary: "administrative" },
  members: [{ type: "way", role: "outer", geometry: square(lat, lon, d) }],
});

test("polygón: bod vnútri / mimo, aj s dierou", () => {
  const rel = {
    type: "relation", id: 1, tags: {},
    members: [
      { type: "way", role: "outer", geometry: square(0, 0, 10) },
      { type: "way", role: "inner", geometry: square(4, 4, 2) },
    ],
  };
  const p = makePolygon(rel);
  assert.equal(p.contains(1, 1), true);
  assert.equal(p.contains(5, 5), false);
  assert.equal(p.contains(11, 1), false);
});

test("mestská časť: najmenšia hranica úrovne 9, bez predpony Bratislava-", () => {
  const polys = [
    admin(1, "8", "okres Bratislava V", 48, 17, 1),
    admin(2, "9", "Bratislava-Petržalka", 48.1, 17.1, 0.1),
    admin(3, "10", "Petržalka k.ú.", 48.1, 17.1, 0.05),
  ].map(makePolygon);
  assert.equal(pickArea(48.12, 17.12, polys), "Petržalka");
  assert.equal(pickArea(48.5, 17.5, polys), "okres Bratislava V");
  assert.equal(cleanAreaName("Bratislava - Staré Mesto"), "Staré Mesto");
  assert.equal(cleanAreaName("Senec"), "Senec");
});

test("súkromné a nepoužívané ihriská sa vynechajú", () => {
  assert.equal(isPublic({ leisure: "playground" }), true);
  assert.equal(isPublic({ leisure: "playground", access: "private" }), false);
  assert.equal(isPublic({ leisure: "playground", access: "customers" }), false);
  assert.equal(isPublic({ leisure: "playground", indoor: "yes" }), false);
});

test("vek z OSM tagov, neznámy = null", () => {
  assert.equal(parseAge("3"), 3);
  assert.equal(parseAge("6 years"), 6);
  assert.equal(parseAge(undefined), null);
  assert.equal(parseAge("baby"), null);
});

test("názov: vlastný, podľa parku, všeobecný", () => {
  assert.equal(displayName({ name: "Detské ihrisko Jasovská" }), "Detské ihrisko Jasovská");
  assert.equal(displayName({ name: "Pirátska loď" }), "Ihrisko Pirátska loď");
  assert.equal(displayName({}, "Park Andreja Hlinku"), "Ihrisko v parku Andreja Hlinku");
  assert.equal(displayName({ "addr:street": "Lipová" }), "Ihrisko, Lipová");
  assert.equal(displayName({}), "Detské ihrisko");
});

test("buildPlaces: vybavenie v ploche, oblasť, park, duplicitný bod, súkromné", () => {
  const playground = { type: "way", id: 10, tags: { leisure: "playground", lit: "yes" }, geometry: square(48.12, 17.12, 0.001) };
  const places = buildPlaces({
    playgroundEls: [
      playground,
      { type: "node", id: 11, lat: 48.1203, lon: 17.1203, tags: { leisure: "playground" } }, // duplicita v ploche
      { type: "node", id: 12, lat: 48.15, lon: 17.15, tags: { leisure: "playground", name: "Pri jazere", min_age: "3", max_age: "12", fee: "yes" } },
      { type: "node", id: 13, lat: 48.16, lon: 17.16, tags: { leisure: "playground", access: "private" } },
    ],
    featureEls: [
      { type: "node", id: 20, lat: 48.1204, lon: 17.1204, tags: { playground: "slide" } },
      { type: "node", id: 21, lat: 48.1205, lon: 17.1205, tags: { playground: "sandpit" } },
      { type: "node", id: 22, lat: 48.1206, lon: 17.1206, tags: { amenity: "bench" } },
      { type: "node", id: 23, lat: 48.15005, lon: 17.15005, tags: { playground: "swing" } }, // ~7 m od bodového ihriska
      { type: "node", id: 24, lat: 48.3, lon: 17.3, tags: { playground: "swing" } }, // ďaleko
    ],
    parkEls: [{ type: "way", id: 30, tags: { leisure: "park", name: "Sad Janka Kráľa" }, geometry: square(48.11, 17.11, 0.02) }],
    adminEls: [admin(2, "9", "Bratislava-Petržalka", 48.1, 17.1, 0.1)],
  });

  assert.deepEqual(places.map((p) => p.id), ["osm-n12", "osm-w10"]);
  const [jazero, park] = places;
  assert.equal(park.name, "Ihrisko v parku Sad Janka Kráľa");
  assert.equal(park.area, "Petržalka");
  assert.deepEqual(park.amenities, ["pieskovisko", "šmykľavka", "lavičky", "osvetlenie"]);
  assert.equal(park.ageMin, null);
  assert.deepEqual(park.price, { kind: "free" });
  assert.equal(park.isDemo, false);
  assert.equal(park.source, "osm");
  assert.equal(park.verified, false);

  assert.equal(jazero.name, "Ihrisko Pri jazere");
  assert.equal(jazero.ageMin, 3);
  assert.equal(jazero.ageMax, 12);
  assert.deepEqual(jazero.price, { kind: "unknown" });
  assert.deepEqual(jazero.amenities, ["hojdačky"]);
});
