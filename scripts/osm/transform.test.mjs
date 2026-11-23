import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPlaces, cleanAreaName, disambiguate, displayName, isPublic, makePolygon, makeStreetIndex, metersToSegment,
  nearestStreets, parseAge, pickArea,
} from "./transform.mjs";

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

test("názov: vlastný, park, ulica, mestská časť, všeobecný", () => {
  const n = (tags, ctx) => displayName(tags, ctx).name;
  assert.equal(n({ name: "Detské ihrisko Jasovská" }), "Detské ihrisko Jasovská");
  assert.equal(n({ name: "Pirátska loď" }, { parkName: "Sad Janka Kráľa" }), "Ihrisko Pirátska loď");
  assert.equal(n({}, { parkName: "Park Andreja Hlinku" }), "Ihrisko v parku Andreja Hlinku");
  assert.equal(n({}, { parkName: "Kaštieľsky park" }), "Ihrisko, Kaštieľsky park");
  assert.equal(n({ "addr:street": "Lipová" }, { streets: ["Iná"] }), "Ihrisko, Lipová");
  assert.equal(n({}, { streets: ["Romanova", "Jungmannova"], area: "Petržalka" }), "Ihrisko, Romanova");
  assert.equal(n({}, { streets: [], area: "Lamač" }), "Ihrisko, Lamač");
  assert.equal(n({}), "Detské ihrisko");
  assert.equal(displayName({}, { streets: ["Romanova"] }).nameSource, "street");
  assert.equal(displayName({ name: "X ihrisko" }).nameSource, "osm");
});

test("vzdialenosť k úseku a najbližšie ulice do 150 m", () => {
  // ~111 m severne od úseku
  assert.ok(Math.abs(metersToSegment({ lat: 48.001, lon: 17.0005 }, { lat: 48, lon: 17 }, { lat: 48, lon: 17.001 }) - 111.3) < 1);
  const idx = makeStreetIndex([
    { type: "way", id: 1, tags: { name: "Blízka" }, geometry: [{ lat: 48, lon: 17 }, { lat: 48, lon: 17.002 }] },
    { type: "way", id: 2, tags: { name: "Blízka" }, geometry: [{ lat: 48.0005, lon: 17 }, { lat: 48.0005, lon: 17.002 }] },
    { type: "way", id: 3, tags: { name: "Druhá" }, geometry: [{ lat: 48.0012, lon: 17 }, { lat: 48.0012, lon: 17.002 }] },
    { type: "way", id: 4, tags: { name: "Ďaleká" }, geometry: [{ lat: 48.01, lon: 17 }, { lat: 48.01, lon: 17.002 }] },
    { type: "way", id: 5, tags: {}, geometry: [{ lat: 48.0004, lon: 17 }, { lat: 48.0004, lon: 17.002 }] },
  ]);
  assert.deepEqual(nearestStreets(48.0004, 17.001, idx), ["Blízka", "Druhá"]);
  assert.deepEqual(nearestStreets(48.05, 17.001, idx), []);
});

test("rovnaké odvodené názvy sa rozlíšia druhou ulicou, vlastné ostanú", () => {
  const e = (name, nameSource, streets) => ({ place: { name, nameSource }, streets });
  const list = [
    e("Ihrisko, Romanova", "street", ["Romanova", "Jungmannova"]),
    e("Ihrisko, Romanova", "street", ["Romanova", "Gessayova"]),
    e("Ihrisko, Romanova", "street", ["Romanova"]),
    e("Ihrisko, Sad Janka Kráľa", "park", ["Viedenská cesta"]),
    e("Ihrisko, Sad Janka Kráľa", "park", []),
    e("Ihrisko Mier", "osm", ["Romanova"]),
    e("Ihrisko Mier", "osm", ["Romanova"]),
    e("Ihrisko, Lipová", "street", ["Lipová"]),
  ];
  disambiguate(list);
  assert.deepEqual(list.map((x) => x.place.name), [
    "Ihrisko, Romanova / Jungmannova",
    "Ihrisko, Romanova / Gessayova",
    "Ihrisko, Romanova",
    "Ihrisko, Sad Janka Kráľa (Viedenská cesta)",
    "Ihrisko, Sad Janka Kráľa",
    "Ihrisko Mier",
    "Ihrisko Mier",
    "Ihrisko, Lipová",
  ]);
});

test("buildPlaces: vybavenie v ploche, oblasť, park, duplicitný bod, súkromné", () => {
  const playground = { type: "way", id: 10, tags: { leisure: "playground", lit: "yes" }, geometry: square(48.12, 17.12, 0.001) };
  const places = buildPlaces({
    playgroundEls: [
      playground,
      { type: "node", id: 11, lat: 48.1203, lon: 17.1203, tags: { leisure: "playground" } }, // duplicita v ploche
      { type: "node", id: 12, lat: 48.15, lon: 17.15, tags: { leisure: "playground", name: "Pri jazere", min_age: "3", max_age: "12", fee: "yes" } },
      { type: "node", id: 13, lat: 48.16, lon: 17.16, tags: { leisure: "playground", access: "private" } },
      { type: "node", id: 14, lat: 48.17, lon: 17.17, tags: { leisure: "playground" } }, // pri ulici
      { type: "node", id: 15, lat: 48.18, lon: 17.18, tags: { leisure: "playground" } }, // bez ulice → mestská časť
      { type: "node", id: 16, lat: 48.1302, lon: 17.125, tags: { leisure: "playground" } }, // ~22 m za okrajom parku
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
    streetEls: [{ type: "way", id: 40, tags: { highway: "residential", name: "Romanova" }, geometry: [{ lat: 48.1705, lon: 17.169 }, { lat: 48.1705, lon: 17.171 }] }],
  });

  assert.deepEqual(places.map((p) => p.id), ["osm-n12", "osm-n14", "osm-n15", "osm-n16", "osm-w10"]);
  const [jazero, ulica, cast, okraj, park] = places;
  assert.equal(ulica.name, "Ihrisko, Romanova");
  assert.equal(ulica.nameSource, "street");
  assert.equal(cast.name, "Ihrisko, Petržalka");
  assert.equal(okraj.name, "Ihrisko, Sad Janka Kráľa");
  assert.equal(park.name, "Ihrisko, Sad Janka Kráľa");
  assert.equal(park.nameSource, "park");
  assert.equal(park.area, "Petržalka");
  assert.deepEqual(park.amenities, ["pieskovisko", "šmykľavka", "lavičky", "osvetlenie"]);
  assert.equal(park.ageMin, null);
  assert.deepEqual(park.price, { kind: "free" });
  assert.equal(park.isDemo, false);
  assert.equal(park.source, "osm");
  assert.equal(park.verified, false);

  assert.equal(jazero.name, "Ihrisko Pri jazere");
  assert.equal(jazero.nameSource, "osm");
  assert.equal(jazero.ageMin, 3);
  assert.equal(jazero.ageMax, 12);
  assert.deepEqual(jazero.price, { kind: "unknown" });
  assert.deepEqual(jazero.amenities, ["hojdačky"]);
});
