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
const MATCH = /ihrisk|ihrísk|playground|detsk|hrisk/i;
const RELATED = /šport|sport|ihr|park|zeleň|zelen|voľn|rekre/i;
const related = [];
const log = [];
const note = (m) => { console.log(m); log.push(m); };

async function getJson(url, timeoutMs = 30000) {
  const ctrl = AbortSignal.timeout(timeoutMs);
  const res = await fetch(url, { headers: UA, signal: ctrl });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Prejde ArcGIS REST adresár (priečinky → služby → vrstvy) a vráti vrstvy s ihriskami. */
async function crawlArcgis(root, maxServices = 3000) {
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
          if (RELATED.test(s.name) || RELATED.test(l.name)) related.push(`${s.name} / ${l.id}: ${l.name} (${l.geometryType})`);
          // Register všetkých športovísk mesta: ihriská sa z neho vyberú podľa atribútov (filter nižšie).
          if (/športovisk|sport_body/i.test(`${s.name} ${l.name}`) && l.geometryType === "esriGeometryPoint") {
            found.push({ service: s.name, type: s.type, layerId: l.id, name: l.name, geometryType: l.geometryType, url: `${base}/${l.id}`, attrFilter: "detsk[éy]+ ihrisk" });
          }
          if (MATCH.test(l.name)) {
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
  try {
    return await fetchPaged(layer, "geojson");
  } catch (e) {
    note(`Vrstva ${layer.name}: GeoJSON zlyhal (${e.message}), skúšam formát Esri JSON`);
    return await fetchPaged(layer, "json");
  }
}

/** Stránkované stiahnutie vrstvy; formát „json“ (Esri) sa prevedie na GeoJSON body. */
async function fetchPaged(layer, format) {
  const features = [];
  let offset = 0;
  const size = format === "json" ? 500 : 1000;
  for (;;) {
    const extra = format === "geojson" ? "&returnCentroid=true" : "";
    const q = `${layer.url}/query?where=1%3D1&outFields=*&outSR=4326&f=${format}&resultOffset=${offset}&resultRecordCount=${size}${extra}`;
    const j = await getJson(q, 60000);
    if (j.error) throw new Error(`ArcGIS ${j.error.code}: ${j.error.message}`);
    const batch =
      format === "geojson"
        ? (j.features ?? [])
        : (j.features ?? []).map((f) => ({
            properties: f.attributes,
            geometry: f.geometry && "x" in f.geometry ? { type: "Point", coordinates: [f.geometry.x, f.geometry.y] } : null,
          }));
    features.push(...batch);
    if (!batch.length || !(j.exceededTransferLimit || j.properties?.exceededTransferLimit)) break;
    offset += batch.length;
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

/** Licenčné a popisné metadáta vrstvy z ArcGIS (služba, vrstva, položka portálu). */
async function layerMetadata(layer) {
  const serviceUrl = layer.url.replace(/\/\d+$/, "");
  const out = { checkedAt: new Date().toISOString(), sources: {} };
  const take = (o, keys) => Object.fromEntries(keys.filter((k) => o?.[k]).map((k) => [k, String(o[k]).slice(0, 2000)]));
  for (const [name, url, keys] of [
    ["service", `${serviceUrl}?f=json`, ["copyrightText", "serviceDescription", "description"]],
    ["layer", `${layer.url}?f=json`, ["copyrightText", "description"]],
    ["item", `${serviceUrl}/info/iteminfo?f=json`, ["title", "licenseInfo", "accessInformation", "description", "snippet", "owner"]],
  ]) {
    try {
      out.sources[name] = { url, ...take(await getJson(url), keys) };
    } catch (e) {
      out.sources[name] = { url, error: e.message };
    }
  }
  note(`Metadáta ${layer.name}: ${JSON.stringify(out.sources).slice(0, 1500)}`);
  return out;
}

const str = (v) => (typeof v === "string" && v.trim() && !["-", "<Null>", " "].includes(v.trim()) ? v.trim() : null);

/** Mestské detské ihriská, ktoré chýbajú v OSM: kandidáti do aplikácie a zoznam vyradených s dôvodom. */
function buildCityCandidates({ layer, missing }) {
  const places = [];
  const excluded = [];
  for (const m of missing) {
    const p = m.props ?? {};
    const name = str(p["oficiálny_názov"]) ?? str(p["oficiálny_názov_1"]);
    const area = str(p["mestská_časť"]) ?? "Bratislava";
    const street = str(p.ulica) ?? str(p.adresa);
    const isPublic = str(p["dostupnosť_pre_verejnosť"]);
    const state = str(p.stav) ?? str(p.stav_1);
    const base = { name: name ?? "Detské ihrisko", area, street, lat: m.lat, lng: m.lng, public: isPublic, state, areal: str(p["druh_areálu"]) };
    let reason = null;
    if (isPublic !== "áno") reason = isPublic === "nie" ? "neverejné (podľa mesta)" : "verejná prístupnosť neuvedená";
    else if (state !== "v prevádzke") reason = `stav: ${state ?? "neuvedený"}`;
    if (reason) {
      excluded.push({ ...base, reason });
      continue;
    }
    const gid = String(p.globalid ?? p.globalid__ ?? `${m.lat},${m.lng}`).replace(/[{}]/g, "").toLowerCase();
    const generic = !name || /^(zš|zs|mš|ms|gymn|sš)/i.test(name);
    places.push({
      id: `city-${gid.slice(0, 13)}`,
      name: generic ? (street ? `Detské ihrisko, ${street}` : `Detské ihrisko${name ? ` pri ${name}` : ""}`) : /ihrisk/i.test(name) ? name : `Ihrisko ${name}`,
      named: Boolean(name),
      category: "ihrisko",
      area,
      lat: m.lat,
      lng: m.lng,
      ageMin: null,
      ageMax: null,
      indoor: false,
      score: null,
      reviewCount: 0,
      price: str(p["spoplatnenie_pre_verejnosť"]) === "neplatené" ? { kind: "free" } : { kind: "unknown" },
      hoursToday: null,
      openingHours: null,
      amenities: [],
      surface: null,
      verified: false,
      isDemo: false,
      source: "city",
      street,
      cityId: gid,
    });
  }
  return { layerUrl: layer.url, metadata: layer.metadata, places, excluded };
}

const osm = JSON.parse(await readFile("src/data/osm/playgrounds.json", "utf8"));
const roots = ["https://geoportal.bratislava.sk/hsite/rest/services", "https://geoportal.bratislava.sk/arcgis/rest/services"];
const layers = [];
for (const r of roots) layers.push(...(await crawlArcgis(r)));
const openData = await searchOpenData();

const datasets = [];
let cityCandidates = null;
for (const layer of layers) {
  try {
    const feats = await fetchLayer(layer);
    let points = feats.map((f) => ({ c: centroid(f.geometry), props: f.properties })).filter((x) => x.c);
    if (layer.attrFilter) {
      const re = new RegExp(layer.attrFilter, "i");
      const values = {};
      for (const p of points) for (const [k, v] of Object.entries(p.props ?? {})) if (typeof v === "string" && v.length < 60) (values[k] ??= new Set()).add(v);
      layer.attributeValues = Object.fromEntries(
        Object.entries(values).filter(([, set]) => set.size <= 40).map(([k, set]) => [k, [...set].sort()]),
      );
      note(`Vrstva ${layer.name}: ${points.length} objektov spolu, filter /${layer.attrFilter}/ v atribútoch`);
      points = points.filter((p) => Object.values(p.props ?? {}).some((v) => typeof v === "string" && re.test(v)));
    }
    let matched = 0;
    const missing = [];
    for (const p of points) {
      const near = osm.places.find((o) => metersBetween({ lat: o.lat, lon: o.lng }, p.c) <= 60);
      if (near) matched++;
      else missing.push({ lat: +p.c.lat.toFixed(6), lng: +p.c.lon.toFixed(6), props: p.props });
    }
    note(`Vrstva ${layer.name}: ${points.length} objektov, zhoda s OSM ${matched}, chýba v OSM ${missing.length}`);
    if (layer.attrFilter) {
      layer.metadata = await layerMetadata(layer);
      cityCandidates = { layer, missing };
    }
    datasets.push({ ...layer, count: points.length, totalFeatures: feats.length, matchedInOsm: matched, missingInOsm: missing.slice(0, 300), sampleProps: points[0]?.props ?? null });
  } catch (e) {
    note(`Vrstva ${layer.name}: ${e.message}`);
    datasets.push({ ...layer, error: e.message });
  }
}

await writeFile(
  "src/data/osm/city-crosscheck.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), osmCount: osm.places.length, layers: datasets, relatedLayers: related, openData, log }, null, 2) + "\n",
);
console.log("Zapísané src/data/osm/city-crosscheck.json");

if (cityCandidates) {
  const c = buildCityCandidates(cityCandidates);
  const { places: list, ...meta } = {
    _note:
      "Detské ihriská z registra športovísk hlavného mesta SR Bratislavy, ktoré chýbajú v OSM. Aplikácia ich zobrazí iba ak je licencia overená (src/data/sources.ts). Generované skriptom scripts/osm/city-crosscheck.mjs.",
    source: "Hlavné mesto SR Bratislava — register športovísk (geoportal.bratislava.sk)",
    generatedAt: new Date().toISOString(),
    ...c,
  };
  const body = JSON.stringify(meta, null, 2).replace(/\n}$/, `,\n  "places": [\n${list.map((p) => "    " + JSON.stringify(p)).join(",\n")}\n  ]\n}\n`);
  await writeFile("src/data/osm/city-playgrounds.json", body);
  note(`Mestské kandidáty: ${list.length} verejných v prevádzke, ${c.excluded.length} vyradených`);

  // Zoznam na oslovenie mesta / mestských častí (Markdown, čitateľný aj bez programovania).
  const md = [
    "# Mestské detské ihriská, ktoré chýbajú v OpenStreetMap",
    "",
    `Generované ${new Date().toISOString().slice(0, 10)} skriptom \`scripts/osm/city-crosscheck.mjs\` z registra športovísk hlavného mesta (vrstva \`${cityCandidates.layer.name}\`).`,
    "Aplikácia ich zobrazí, iba ak je licencia vrstvy overená (`src/data/sources.ts`). Zoznam slúži na oslovenie mesta a mestských častí.",
    "",
    "## Licencia vrstvy podľa metadát",
    "",
    ...Object.entries(c.metadata?.sources ?? {}).map(([k, v]) => `- **${k}**: ${v.error ? `chyba (${v.error})` : Object.entries(v).filter(([kk]) => kk !== "url").map(([kk, vv]) => `${kk}: ${String(vv).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400)}`).join("; ") || "bez údajov o licencii"}`),
    "",
    `## Verejné a v prevádzke (${list.length}) — kandidáti do aplikácie`,
    "",
    "| Názov | Mestská časť | Ulica | GPS |",
    "| --- | --- | --- | --- |",
    ...list.map((p) => `| ${p.name} | ${p.area} | ${p.street ?? ""} | ${p.lat}, ${p.lng} |`),
    "",
    `## Vyradené (${c.excluded.length}) — neverejné alebo mimo prevádzky`,
    "",
    "| Názov | Mestská časť | Dôvod | GPS |",
    "| --- | --- | --- | --- |",
    ...c.excluded.map((p) => `| ${p.name} | ${p.area} | ${p.reason} | ${p.lat}, ${p.lng} |`),
    "",
  ].join("\n");
  await writeFile("docs/MESTSKE_IHRISKA.md", md);
}
