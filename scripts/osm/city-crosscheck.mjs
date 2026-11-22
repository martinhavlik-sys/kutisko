#!/usr/bin/env node
/**
 * Porovnanie OSM ihrísk s otvorenými dátami mesta Bratislava (best-effort).
 *
 * 1. Prehľadá ArcGIS REST katalóg geoportal.bratislava.sk a portál opendata.bratislava.sk
 *    a nájde vrstvy / datasety s ihriskami.
 * 2. Ak nájde bodovú alebo plošnú vrstvu, stiahne ju (GeoJSON, WGS84) a spáruje s OSM do 60 m.
 * 3. Zapíše src/data/osm/city-crosscheck.json: zdroje, počty zhôd, mestské ihriská chýbajúce v OSM.
 *
 * Mestské dáta sa v aplikácii zatiaľ nezobrazujú ako samostatné miesta — slúžia na kontrolu
 * úplnosti OSM a označenie „potvrdené aj mestom“. Licenciu konkrétneho datasetu treba overiť
 * pred zobrazením jeho údajov (zapíše sa do výstupu).
 */
import { readFile, writeFile } from "node:fs/promises";
import { metersBetween } from "./transform.mjs";

const UA = { "user-agent": "kutisko-prototype-import/0.1 (+https://github.com/martinhavlik-sys/kutisko)" };
const MATCH = /ihrisk|ihrísk|playground|detsk[éa] ihr/i;
const log = [];
const note = (m) => { console.log(m); log.push(m); };

async function getJson(url, timeoutMs = 30000) {
  const ctrl = AbortSignal.timeout(timeoutMs);
  const res = await fetch(url, { headers: UA, signal: ctrl });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Prejde ArcGIS REST adresár (priečinky → služby → vrstvy) a vráti vrstvy s ihriskami. */
async function crawlArcgis(root, maxServices = 400) {
  const found = [];
  const queue = [""];
  let services = 0;
  while (queue.length && services < maxServices) {
    const folder = queue.shift();
    let dir;
    try {
      dir = await getJson(`${root}${folder ? "/" + encodeURIComponent(folder).replace(/%2F/g, "/") : ""}?f=json`);
    } catch (e) {
      note(`ArcGIS ${root}/${folder}: ${e.message}`);
      continue;
    }
    for (const f of dir.folders ?? []) queue.push(folder ? `${folder}/${f.split("/").pop()}` : f);
    for (const s of dir.services ?? []) {
      if (!["MapServer", "FeatureServer"].includes(s.type)) continue;
      services++;
      const base = `${root}/${s.name.split("/").map(encodeURIComponent).join("/")}/${s.type}`;
      try {
        const info = await getJson(`${base}/layers?f=json`);
        for (const l of info.layers ?? []) {
          if (MATCH.test(l.name) || MATCH.test(s.name)) {
            found.push({ service: s.name, type: s.type, layerId: l.id, name: l.name, geometryType: l.geometryType, url: `${base}/${l.id}` });
          }
        }
      } catch (e) {
        note(`ArcGIS ${s.name}: ${e.message}`);
      }
    }
  }
  note(`ArcGIS ${root}: prehľadaných služieb ${services}, vrstiev s ihriskami ${found.length}`);
  return found;
}

async function fetchLayer(layer) {
  const features = [];
  let offset = 0;
  for (;;) {
    const q = `${layer.url}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson&resultOffset=${offset}&resultRecordCount=1000&returnCentroid=true`;
    const gj = await getJson(q, 60000);
    features.push(...(gj.features ?? []));
    if (!gj.features?.length || !(gj.exceededTransferLimit || gj.properties?.exceededTransferLimit)) break;
    offset += gj.features.length;
  }
  return features;
}

function centroid(geom) {
  if (!geom) return null;
  const pts = [];
  const walk = (c) => (typeof c[0] === "number" ? pts.push(c) : c.forEach(walk));
  walk(geom.coordinates);
  if (!pts.length) return null;
  const lon = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const lat = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return { lat, lon };
}

async function searchOpenData() {
  const hits = [];
  // Portál opendata.bratislava.sk — skúšame známe tvary API; výsledok sa len zaznamená.
  const candidates = [
    "https://opendata.bratislava.sk/api/dataset?search=ihrisk",
    "https://opendata.bratislava.sk/api/datasets?search=ihrisk",
    "https://opendata.bratislava.sk/api/3/action/package_search?q=ihrisk",
  ];
  for (const url of candidates) {
    try {
      const j = await getJson(url);
      const text = JSON.stringify(j);
      note(`opendata ${url}: OK (${text.length} B)`);
      hits.push({ url, sample: text.slice(0, 2000) });
    } catch (e) {
      note(`opendata ${url}: ${e.message}`);
    }
  }
  return hits;
}

const osm = JSON.parse(await readFile("src/data/osm/playgrounds.json", "utf8"));
const roots = ["https://geoportal.bratislava.sk/hsite/rest/services", "https://geoportal.bratislava.sk/arcgis/rest/services"];
const layers = [];
for (const r of roots) layers.push(...(await crawlArcgis(r)));
const openData = await searchOpenData();

const datasets = [];
for (const layer of layers) {
  try {
    const feats = await fetchLayer(layer);
    const points = feats.map((f) => ({ c: centroid(f.geometry), props: f.properties })).filter((x) => x.c);
    let matched = 0;
    const missing = [];
    for (const p of points) {
      const near = osm.places.find((o) => metersBetween({ lat: o.lat, lon: o.lng }, p.c) <= 60);
      if (near) matched++;
      else missing.push({ lat: +p.c.lat.toFixed(6), lng: +p.c.lon.toFixed(6), props: p.props });
    }
    note(`Vrstva ${layer.name}: ${points.length} objektov, zhoda s OSM ${matched}, chýba v OSM ${missing.length}`);
    datasets.push({ ...layer, count: points.length, matchedInOsm: matched, missingInOsm: missing.slice(0, 300), sampleProps: points[0]?.props ?? null });
  } catch (e) {
    note(`Vrstva ${layer.name}: ${e.message}`);
    datasets.push({ ...layer, error: e.message });
  }
}

await writeFile(
  "src/data/osm/city-crosscheck.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), osmCount: osm.places.length, layers: datasets, openData, log }, null, 2) + "\n",
);
console.log("Zapísané src/data/osm/city-crosscheck.json");
