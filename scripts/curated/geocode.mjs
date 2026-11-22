#!/usr/bin/env node
/**
 * Doplní GPS polohu ručne overeným herniam a kútikom (src/data/curated/indoor-places.json)
 * cez Nominatim (OpenStreetMap). Výsledok: src/data/curated/geo.json.
 *
 *   node scripts/curated/geocode.mjs
 *
 * Poloha © prispievatelia OpenStreetMap, licencia ODbL 1.0. Žiadne údaje z Google.
 * Rešpektuje pravidlá Nominatimu: max. 1 požiadavka za sekundu, vlastný User-Agent.
 * Výsledok sa prijme len vtedy, ak leží do `MAX_KM` od približného bodu `near`
 * (kontrola proti omylu, napr. rovnaká ulica v inom meste).
 * Spúšťa ho GitHub Action „Poloha herní a kútikov (OSM)“ (cloud Claude nemá prístup na Nominatim).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("src/data/curated/indoor-places.json");
const OUT = path.resolve("src/data/curated/geo.json");
const MAX_KM = 2.5;
const UA = "kutisko-prototype-geocode/0.1 (+https://github.com/martinhavlik-sys/kutisko)";

const km = (a, b) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({ q, format: "jsonv2", limit: "5", countrycodes: "sk", "accept-language": "sk" });
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  return res.json();
}

const { places } = JSON.parse(await readFile(SRC, "utf8"));
const out = {
  attribution: "© prispievatelia OpenStreetMap",
  license: "ODbL 1.0",
  generatedAt: new Date().toISOString(),
  places: {},
};
let failed = 0;
for (const p of places) {
  let hit = null;
  for (const q of p.geocode.queries) {
    const results = await search(q);
    await sleep(1100);
    const ok = results
      .map((r) => ({ r, d: km(p.geocode.near, [Number(r.lat), Number(r.lon)]) }))
      .filter((x) => x.d <= MAX_KM)
      .sort((a, b) => a.d - b.d)[0];
    if (ok) {
      hit = {
        lat: Math.round(Number(ok.r.lat) * 1e6) / 1e6,
        lng: Math.round(Number(ok.r.lon) * 1e6) / 1e6,
        query: q,
        osm: { type: ok.r.osm_type, id: ok.r.osm_id },
        match: ok.r.display_name,
        kmFromHint: Math.round(ok.d * 100) / 100,
      };
      break;
    }
    console.warn(`! ${p.id}: „${q}“ → ${results.length} výsledkov, žiadny do ${MAX_KM} km`);
  }
  if (hit) {
    out.places[p.id] = hit;
    console.log(`✓ ${p.id}: ${hit.match} (${hit.kmFromHint} km od odhadu)`);
  } else {
    failed++;
    console.error(`✗ ${p.id}: poloha nenájdená`);
  }
}
await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`Hotovo: ${Object.keys(out.places).length}/${places.length}, zlyhalo ${failed}.`);
if (failed) process.exitCode = 1;
