#!/usr/bin/env node
/**
 * Import verejných detských ihrísk z OpenStreetMap (Overpass API) pre pilot Bratislava a okolie.
 *
 *   node scripts/osm/import-playgrounds.mjs            # stiahne dáta a zapíše src/data/osm/playgrounds.json
 *   node scripts/osm/import-playgrounds.mjs --raw dir  # navyše uloží surové odpovede (na ladenie)
 *
 * Dáta © prispievatelia OpenStreetMap, licencia ODbL 1.0 (https://www.openstreetmap.org/copyright).
 * Skript nepotrebuje kľúč ani platenú službu. Spúšťa ho aj GitHub Action „Import ihrísk (OSM)“.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { BBOX, buildPlaces } from "./transform.mjs";

const ENDPOINTS = [
  process.env.OVERPASS_URL,
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
].filter(Boolean);

// V GitHub Actions sa varovania zobrazia aj ako anotácie behu (čitateľné cez API bez stiahnutia logu).
const warn = (msg) => console.warn(process.env.GITHUB_ACTIONS ? `::warning::${msg}` : msg);

const OUT = path.resolve("src/data/osm/playgrounds.json");
const rawDir = process.argv.includes("--raw") ? process.argv[process.argv.indexOf("--raw") + 1] : null;
const bb = `${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}`;

// Len územie Slovenska (obdĺžnik zasahuje do Rakúska a Maďarska).
const SK = `area["ISO3166-1"="SK"]["admin_level"="2"]->.sk;`;

const QUERIES = {
  playgrounds: `[out:json][timeout:240];${SK}nwr["leisure"="playground"](${bb})(area.sk);out geom;`,
  features: `[out:json][timeout:240];${SK}(nwr["playground"](${bb})(area.sk);node["amenity"~"^(bench|drinking_water|toilets|shelter)$"](${bb})(area.sk););out center;`,
  parks: `[out:json][timeout:240];${SK}nwr["leisure"="park"]["name"](${bb})(area.sk);out geom;`,
  admin: `[out:json][timeout:240];rel["boundary"="administrative"]["admin_level"~"^(8|9|10)$"](${bb});out geom;`,
  // Pomenované ulice do 150 m od ihrísk — na čitateľné názvy ihrísk bez vlastného mena
  // (len okolie ihrísk, nie celý región, aby dopyt ostal malý).
  streets: `[out:json][timeout:240];${SK}nwr["leisure"="playground"](${bb})(area.sk)->.p;way(around.p:150)["highway"~"^(primary|secondary|tertiary|unclassified|residential|living_street|pedestrian|service)$"]["name"];out tags geom;`,
};

async function overpass(name, query) {
  let lastError;
  for (const url of ENDPOINTS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "user-agent": "kutisko-prototype-import/0.1 (+https://github.com/martinhavlik-sys/kutisko)",
          },
          body: new URLSearchParams({ data: query }),
        });
        if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
        const json = await res.json();
        console.log(`✓ ${name}: ${json.elements.length} prvkov (${url})`);
        if (process.env.GITHUB_ACTIONS) console.log(`::notice::${name}: ${json.elements.length} prvkov (${url})`);
        if (rawDir) await writeFile(path.join(rawDir, `${name}.json`), JSON.stringify(json));
        return json;
      } catch (e) {
        lastError = e;
        warn(`${name}: pokus ${attempt} zlyhal: ${e.message}`);
        await new Promise((r) => setTimeout(r, 5000 * attempt));
      }
    }
  }
  throw lastError;
}

if (rawDir) await mkdir(rawDir, { recursive: true });
const results = {};
const OPTIONAL = new Set(["streets"]); // bez ulíc import prejde, ihriská bez mena dostanú názov podľa mestskej časti
for (const [name, q] of Object.entries(QUERIES)) {
  try {
    results[name] = await overpass(name, q);
  } catch (e) {
    if (!OPTIONAL.has(name)) throw e;
    warn(`${name}: preskočené (${e.message})`);
    results[name] = { elements: [] };
  }
}

const places = buildPlaces({
  playgroundEls: results.playgrounds.elements,
  featureEls: results.features.elements,
  parkEls: results.parks.elements,
  adminEls: results.admin.elements,
  streetEls: results.streets.elements,
});

// Prehľad kvality dát do logu (a do súboru).
const count = (pred) => places.filter(pred).length;
const areas = {};
for (const p of places) areas[p.area] = (areas[p.area] ?? 0) + 1;
const stats = {
  total: places.length,
  rawPlaygrounds: results.playgrounds.elements.length,
  streets: results.streets.elements.length,
  named: count((p) => p.named),
  nameSources: Object.fromEntries(["osm", "park", "street", "area", "none"].map((k) => [k, count((p) => p.nameSource === k)])),
  duplicateNames: Object.values(places.reduce((m, p) => ((m[p.name] = (m[p.name] ?? 0) + 1), m), {})).filter((n) => n > 1).reduce((a, n) => a + n, 0),
  withEquipment: count((p) => p.amenities.length > 0),
  withAge: count((p) => p.ageMin !== null || p.ageMax !== null),
  withOpeningHours: count((p) => p.openingHours),
  withSurface: count((p) => p.surface),
  fee: count((p) => p.price.kind === "unknown"),
  areas: Object.fromEntries(Object.entries(areas).sort((a, b) => b[1] - a[1])),
  adminLevels: [...new Set(results.admin.elements.map((e) => `${e.tags.admin_level}:${e.tags.name}`))].sort(),
};
console.log(JSON.stringify(stats, null, 2));

const output = {
  _note:
    "Skutočné verejné ihriská z OpenStreetMap. © prispievatelia OpenStreetMap, ODbL 1.0. Generované skriptom scripts/osm/import-playgrounds.mjs — needitovať ručne.",
  source: "OpenStreetMap (Overpass API)",
  license: "ODbL 1.0",
  attribution: "© prispievatelia OpenStreetMap",
  osmTimestamp: results.playgrounds.osm3s?.timestamp_osm_base ?? null,
  generatedAt: new Date().toISOString(),
  bbox: BBOX,
  stats: { ...stats, adminLevels: undefined },
  places,
};
await mkdir(path.dirname(OUT), { recursive: true });
// Jeden záznam na riadok → čitateľné rozdiely v gite pri ďalšom importe.
const { places: list, ...meta } = output;
const body = JSON.stringify(meta, null, 2).replace(/\n}$/, `,\n  "places": [\n${list.map((p) => "    " + JSON.stringify(p)).join(",\n")}\n  ]\n}\n`);
await writeFile(OUT, body);
console.log(`Zapísané ${places.length} ihrísk → ${path.relative(process.cwd(), OUT)}`);
