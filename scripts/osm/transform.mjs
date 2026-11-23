/**
 * Čistá logika importu ihrísk z OpenStreetMap (bez siete) — testovaná v transform.test.mjs.
 *
 * Vstup: prvky z Overpass API (`out geom tags` / `out center tags`).
 * Výstup: záznamy kompatibilné s modelom `Place` v src/data/places.ts (zdroj „osm“).
 *
 * Zásady (PRODUCT_MANIFESTO.md bod 5): neznáme údaje nevyzerajú negatívne — chýbajúci vek,
 * hodiny či vybavenie sa ukladajú ako `null` / prázdne a UI ich označí „neuvedené“.
 */

/** Hraničný obdĺžnik pilotu: Bratislava a okolie (Malacky, Stupava, Pezinok, Senec, Šamorín). */
export const BBOX = { south: 47.98, west: 16.83, north: 48.47, east: 17.48 };

/** OSM tag `playground=*` → slovenský názov vybavenia (zobrazený v UI, filtrovateľný). */
export const EQUIPMENT_LABELS = {
  slide: "šmykľavka",
  swing: "hojdačky",
  basketswing: "hojdačka hniezdo",
  baby_swing: "hojdačka pre bábätká",
  sandpit: "pieskovisko",
  climbingframe: "preliezky",
  climbing_frame: "preliezky",
  climbingwall: "lezecká stena",
  climbing_wall: "lezecká stena",
  rope_traverse: "lanová dráha",
  climbing_net: "lanová sieť",
  net: "lanová sieť",
  zipwire: "lanovka",
  seesaw: "hojdačka váhadlo",
  springy: "pružinové hojdačky",
  roundabout: "kolotoč",
  merry_go_round: "kolotoč",
  playhouse: "domček",
  structure: "herná zostava",
  trampoline: "trampolína",
  water: "vodné prvky",
  splash_pad: "vodné prvky",
  pump: "vodné prvky",
  balance_beam: "balančná kladina",
  sledding: "sánkovací kopec",
  tunnel_tube: "tunel",
  musical_instrument: "hudobné prvky",
};

/** Ďalšie vybavenie v areáli ihriska (amenity=*). */
export const AMENITY_LABELS = {
  bench: "lavičky",
  drinking_water: "pitná voda",
  toilets: "toalety",
  shelter: "prístrešok",
};

const SURFACE_LABELS = {
  sand: "piesok",
  grass: "tráva",
  woodchips: "drevná štiepka",
  rubber: "gumová dopadová plocha",
  rubbercrumb: "gumová dopadová plocha",
  tartan: "gumová dopadová plocha",
  artificial_turf: "umelá tráva",
  fine_gravel: "jemný štrk",
  pebblestone: "kamienky",
};

/** Ihriská, ktoré nie sú verejne prístupné, sa neimportujú. */
export function isPublic(tags) {
  const access = tags.access;
  if (["private", "no", "customers", "permit", "students", "members"].includes(access)) return false;
  if (tags["disused:leisure"] || tags.disused === "yes" || tags.abandoned === "yes") return false;
  if (tags.indoor === "yes") return false; // vnútorné herne mapujeme ručne, nie z OSM
  return true;
}

/** Nezáporné celé číslo z OSM tagu (napr. min_age=3, „3 years“), inak null. */
export function parseAge(v) {
  if (v === undefined || v === null) return null;
  const m = String(v).match(/^\s*(\d{1,2})/);
  return m ? Number(m[1]) : null;
}

/** Ray casting s pravidlom párny–nepárny nad všetkými úsekmi (funguje aj s viacerými prstencami a dierami bez skladania). */
export function pointInSegments(lat, lon, segments) {
  let inside = false;
  for (const [a, b] of segments) {
    if (a.lat > lat !== b.lat > lat) {
      const x = a.lon + ((lat - a.lat) / (b.lat - a.lat)) * (b.lon - a.lon);
      if (lon < x) inside = !inside;
    }
  }
  return inside;
}

/** Úseky obrysu prvku z Overpass (`out geom`): way.geometry alebo relation.members[].geometry. */
export function segmentsOf(el) {
  const rings = [];
  if (el.type === "way" && el.geometry) rings.push(el.geometry);
  if (el.type === "relation" && el.members) {
    for (const m of el.members) if (m.type === "way" && m.geometry && m.role !== "label") rings.push(m.geometry);
  }
  const segs = [];
  for (const g of rings) {
    for (let i = 0; i + 1 < g.length; i++) if (g[i] && g[i + 1]) segs.push([g[i], g[i + 1]]);
  }
  return segs;
}

export function bboxOf(segments) {
  let s = 90, w = 180, n = -90, e = -180;
  for (const [a] of segments) {
    s = Math.min(s, a.lat); n = Math.max(n, a.lat); w = Math.min(w, a.lon); e = Math.max(e, a.lon);
  }
  return { s, w, n, e };
}

/** Polygón s rýchlym predtestom obdĺžnika. Vráti null, ak prvok nemá plochu. */
export function makePolygon(el) {
  const segments = segmentsOf(el);
  if (segments.length < 3) return null;
  const bb = bboxOf(segments);
  return {
    el,
    bb,
    area: (bb.n - bb.s) * (bb.e - bb.w),
    contains(lat, lon) {
      if (lat < bb.s || lat > bb.n || lon < bb.w || lon > bb.e) return false;
      return pointInSegments(lat, lon, segments);
    },
  };
}

/** Ťažisko obrysu (priemer bodov) pre way/relation bez `center`. */
export function centerOf(el) {
  if (el.type === "node") return { lat: el.lat, lon: el.lon };
  if (el.center) return el.center;
  const segs = segmentsOf(el);
  if (!segs.length) return null;
  const bb = bboxOf(segs);
  return { lat: (bb.s + bb.n) / 2, lon: (bb.w + bb.e) / 2 };
}

function metersBetween(a, b) {
  const dLat = (b.lat - a.lat) * 111_320;
  const dLon = (b.lon - a.lon) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLon);
}
export { metersBetween };

const ID_PREFIX = { node: "n", way: "w", relation: "r" };
export const placeIdFor = (el) => `osm-${ID_PREFIX[el.type]}${el.id}`;

/** Odstráni slovo „Bratislava-“ z oficiálnych názvov mestských častí („Bratislava-Petržalka“ → „Petržalka“). */
export function cleanAreaName(name) {
  if (!name) return null;
  return name.replace(/^(mestská časť\s+)?Bratislava\s*[-–]\s*/i, "").replace(/^mestská časť\s+/i, "").trim();
}

/**
 * Vyberie mestskú časť / obec: najmenšiu administratívnu hranicu úrovne 9 (SK: obec, mestská časť),
 * inak 10, inak 8. Vstup: polygóny s `el.tags.admin_level`.
 */
export function pickArea(lat, lon, adminPolygons) {
  const hits = adminPolygons.filter((p) => p.contains(lat, lon));
  for (const level of ["9", "10", "8"]) {
    const atLevel = hits.filter((p) => p.el.tags.admin_level === level).sort((a, b) => a.area - b.area);
    if (atLevel.length) return cleanAreaName(atLevel[0].el.tags.name);
  }
  return null;
}

/** Vzdialenosť bodu od úseku v metroch (lokálna rovinná aproximácia, na stovky metrov stačí). */
export function metersToSegment(p, a, b) {
  const k = 111_320;
  const cos = Math.cos((p.lat * Math.PI) / 180);
  const ax = (a.lon - p.lon) * k * cos, ay = (a.lat - p.lat) * k;
  const bx = (b.lon - p.lon) * k * cos, by = (b.lat - p.lat) * k;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
  return Math.hypot(ax + t * dx, ay + t * dy);
}

/** Najmenšia vzdialenosť bodu od obrysu/čiary (úseky zo `segmentsOf`). */
export function metersToSegments(p, segments) {
  let best = Infinity;
  for (const [a, b] of segments) best = Math.min(best, metersToSegment(p, a, b));
  return best;
}

/** Ulica do tejto vzdialenosti sa ešte použije v názve ihriska (na sídliskách býva vnútroblok aj 200 m od ulice). */
export const STREET_MAX_M = 300;
/** Štvrť / lokalita (place=neighbourhood…) do tejto vzdialenosti, ak v okolí nie je ulica. */
export const PLACE_MAX_M = 800;
/** Ihrisko tesne pri okraji parku (napr. zakreslené bodom na hranici) patrí k parku. */
export const PARK_EDGE_M = 30;

/** Pomenované ulice z Overpass (`out geom`) pripravené na rýchle hľadanie najbližšej. */
export function makeStreetIndex(streetEls) {
  const pad = STREET_MAX_M / 111_320 * 1.6; // rezerva v stupňoch (aj pre dĺžku na 48° s. š.)
  return streetEls
    .filter((el) => el.tags?.name && el.geometry && !el.tags.bridge && !el.tags.tunnel)
    .map((el) => {
      const segments = segmentsOf(el);
      if (!segments.length) return null;
      const bb = bboxOf([...segments, [segments.at(-1)[1], segments.at(-1)[1]]]);
      return { name: el.tags["name:sk"] || el.tags.name, segments, bb: { s: bb.s - pad, n: bb.n + pad, w: bb.w - pad, e: bb.e + pad } };
    })
    .filter(Boolean);
}

/** Názvy ulíc do STREET_MAX_M od bodu, od najbližšej (každý názov raz). */
export function nearestStreets(lat, lon, streetIndex, maxM = STREET_MAX_M) {
  const best = new Map();
  for (const s of streetIndex) {
    if (lat < s.bb.s || lat > s.bb.n || lon < s.bb.w || lon > s.bb.e) continue;
    const d = metersToSegments({ lat, lon }, s.segments);
    if (d <= maxM && d < (best.get(s.name) ?? Infinity)) best.set(s.name, d);
  }
  return [...best.entries()].sort((a, b) => a[1] - b[1]).map(([name]) => name);
}

/** Najbližšia pomenovaná štvrť/lokalita (bod place=*) do PLACE_MAX_M, inak null. */
export function nearestPlaceName(lat, lon, placeEls, maxM = PLACE_MAX_M) {
  let best = null, bestD = maxM;
  for (const el of placeEls) {
    const c = centerOf(el);
    const name = el.tags?.["name:sk"] || el.tags?.name;
    if (!c || !name) continue;
    const d = metersBetween({ lat, lon }, c);
    if (d <= bestD) { best = name; bestD = d; }
  }
  return best;
}

/** „Park Andreja Hlinku“ → „Ihrisko v parku Andreja Hlinku“; iné názvy („Sad Janka Kráľa“, „Kaštieľsky park“) → „Ihrisko, …“. */
function parkLabel(parkName) {
  const m = parkName.match(/^park\s+(.+)$/i);
  return m ? `Ihrisko v parku ${m[1]}` : `Ihrisko, ${parkName}`;
}

/**
 * Názov ihriska a odkiaľ pochádza.
 * Poradie: vlastný názov v OSM → park → ulica v adrese ihriska → najbližšia ulica (do 300 m)
 * → štvrť/lokalita (do 800 m) → mestská časť/obec.
 * @param tags OSM tagy ihriska
 * @param ctx { parkName?, streets?: string[] (od najbližšej), placeName?, area? }
 * @returns { name, nameSource: "osm" | "park" | "street" | "place" | "area" | "none" }
 */
export function displayName(tags, ctx = {}) {
  const own = tags["name:sk"] || tags.name;
  if (own) {
    return { name: /ihrisk|playground|park|hrisk/i.test(own) ? own : `Ihrisko ${own}`, nameSource: "osm" };
  }
  if (ctx.parkName) return { name: parkLabel(ctx.parkName), nameSource: "park" };
  const street = tags["addr:street"] || ctx.streets?.[0];
  if (street) return { name: `Ihrisko, ${street}`, nameSource: "street" };
  if (ctx.placeName && ctx.placeName !== ctx.area) return { name: `Ihrisko, ${ctx.placeName}`, nameSource: "place" };
  if (ctx.area) return { name: `Ihrisko, ${ctx.area}`, nameSource: "area" };
  return { name: "Detské ihrisko", nameSource: "none" };
}

/**
 * Rovnaké odvodené názvy rozlíši druhou ulicou („Ihrisko, Romanova / Jungmannova“),
 * pri parku najbližšou ulicou v zátvorke. Vlastné názvy z OSM sa nemenia; nečíslujeme
 * (číslo by vyzeralo ako adresa). Čo sa rozlíšiť nedá, ostane — odlíši ho mapa a oblasť.
 * @param entries [{ place, streets: string[] }]
 */
export function disambiguate(entries) {
  const groups = new Map();
  for (const e of entries) {
    if (e.place.nameSource === "osm") continue;
    const key = e.place.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    for (const e of group) {
      const p = e.place;
      if (p.nameSource === "street") {
        const base = p.name.slice("Ihrisko, ".length);
        const other = e.streets.find((s) => s !== base);
        if (other) p.name = `${p.name} / ${other}`;
      } else if (p.nameSource === "park" && e.streets[0]) {
        p.name = `${p.name} (${e.streets[0]})`;
      }
    }
  }
}

/**
 * Prevod jedného ihriska na záznam aplikácie.
 * @param el prvok leisure=playground
 * @param ctx { area, parkName, streets: string[], placeName, equipment: Set<string>, amenities: Set<string> }
 */
export function toPlace(el, ctx) {
  const t = el.tags ?? {};
  const c = centerOf(el);
  const minAge = parseAge(t.min_age);
  const maxAge = parseAge(t.max_age);
  const equipment = new Set(ctx.equipment ?? []);
  if (t.playground && EQUIPMENT_LABELS[t.playground]) equipment.add(EQUIPMENT_LABELS[t.playground]);
  for (const key of Object.keys(t)) {
    const m = key.match(/^playground:(\w+)$/);
    if (m && t[key] !== "no" && EQUIPMENT_LABELS[m[1]]) equipment.add(EQUIPMENT_LABELS[m[1]]);
  }
  const amenities = new Set(ctx.amenities ?? []);
  if (t.lit === "yes") amenities.add("osvetlenie");
  if (t.wheelchair === "yes") amenities.add("bezbariérové");
  if (t.covered === "yes") amenities.add("prístrešok");
  if (t.fenced === "yes" || t.barrier === "fence") amenities.add("oplotené");

  const surface = SURFACE_LABELS[t.surface] ?? null;

  return {
    id: placeIdFor(el),
    ...displayName(t, ctx),
    named: Boolean(t["name:sk"] || t.name),
    category: "ihrisko",
    area: ctx.area ?? "Bratislava a okolie",
    lat: round(c.lat, 6),
    lng: round(c.lon, 6),
    ageMin: minAge,
    ageMax: maxAge,
    indoor: false,
    score: null,
    reviewCount: 0,
    // Verejné ihrisko je bez vstupného, pokiaľ OSM neuvádza poplatok (fee=yes → neznáma cena).
    price: t.fee === "yes" ? { kind: "unknown" } : { kind: "free" },
    hoursToday: null,
    openingHours: t.opening_hours ?? null,
    amenities: [...equipment].sort((a, b) => a.localeCompare(b, "sk")).concat([...amenities].sort((a, b) => a.localeCompare(b, "sk"))),
    surface,
    verified: false,
    isDemo: false,
    source: "osm",
    osm: { type: el.type, id: el.id },
  };
}

function round(n, d) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

/**
 * Zostaví všetky miesta zo surových odpovedí Overpass.
 * @param playgroundEls prvky leisure=playground (way/relation s geometriou, node s lat/lon)
 * @param featureEls body vybavenia (playground=*, amenity=bench…) — node alebo s `center`
 * @param parkEls parky (leisure=park) s geometriou
 * @param adminEls administratívne hranice s geometriou
 * @param streetEls pomenované ulice (highway=* s name) s geometriou — na názvy ihrísk bez mena
 * @param placeEls pomenované štvrte/lokality (place=neighbourhood…) — záloha, ak v okolí nie je ulica
 */
export function buildPlaces({ playgroundEls, featureEls, parkEls, adminEls, streetEls = [], placeEls = [] }) {
  const adminPolys = adminEls.map(makePolygon).filter(Boolean);
  const parkPolys = parkEls.filter((p) => p.tags?.name).map(makePolygon).filter(Boolean);
  const parkSegs = new Map(parkPolys.map((p) => [p, segmentsOf(p.el)]));
  const streetIndex = makeStreetIndex(streetEls);

  const candidates = playgroundEls.filter((el) => isPublic(el.tags ?? {}));
  const polys = new Map();
  for (const el of candidates) {
    if (el.type !== "node") {
      const p = makePolygon(el);
      if (p) polys.set(el, p);
    }
  }

  // Vybavenie: bod vnútri plochy ihriska; pri ihrisku zakreslenom len bodom do 25 m.
  const equipment = new Map(candidates.map((el) => [el, new Set()]));
  const amenities = new Map(candidates.map((el) => [el, new Set()]));
  const nodePlaygrounds = candidates.filter((el) => el.type === "node");
  for (const f of featureEls) {
    const c = centerOf(f);
    if (!c) continue;
    const ft = f.tags ?? {};
    const label = ft.playground ? EQUIPMENT_LABELS[ft.playground] : AMENITY_LABELS[ft.amenity];
    if (!label) continue;
    const target = ft.playground ? equipment : amenities;
    let owner = null;
    for (const [el, poly] of polys) {
      if (poly.contains(c.lat, c.lon)) { owner = el; break; }
    }
    if (!owner && ft.playground) {
      owner = nodePlaygrounds.find((n) => metersBetween(n, c) <= 25) ?? null;
    }
    if (owner) target.get(owner).add(label);
  }

  const entries = [];
  const edgePad = PARK_EDGE_M / 111_320 * 1.6;
  for (const el of candidates) {
    const c = centerOf(el);
    if (!c) continue;
    const park =
      parkPolys.filter((p) => p.contains(c.lat, c.lon)).sort((a, b) => a.area - b.area)[0] ??
      parkPolys
        .filter(
          (p) =>
            c.lat >= p.bb.s - edgePad && c.lat <= p.bb.n + edgePad && c.lon >= p.bb.w - edgePad && c.lon <= p.bb.e + edgePad &&
            metersToSegments(c, parkSegs.get(p)) <= PARK_EDGE_M,
        )
        .sort((a, b) => a.area - b.area)[0];
    const named = Boolean(el.tags?.["name:sk"] || el.tags?.name);
    const streets = named ? [] : nearestStreets(c.lat, c.lon, streetIndex);
    const placeName = named || streets.length ? null : nearestPlaceName(c.lat, c.lon, placeEls);
    const place = toPlace(el, {
      area: pickArea(c.lat, c.lon, adminPolys),
      placeName,
      parkName: park?.el.tags.name ?? null,
      streets,
      equipment: equipment.get(el),
      amenities: amenities.get(el),
    });
    entries.push({ place, streets });
  }
  const places = entries.map((e) => e.place);

  // Duplicity: ihrisko zakreslené bodom aj plochou — bod ležiaci v ploche iného ihriska (alebo do 15 m od nej) sa vynechá.
  const polyList = [...polys.values()];
  const deduped = places.filter((p) => {
    if (p.osm.type !== "node") return true;
    return !polyList.some(
      (poly) => poly.contains(p.lat, p.lng) || metersBetween(centerOf(poly.el), { lat: p.lat, lon: p.lng }) <= 15,
    );
  });

  const kept = new Set(deduped);
  disambiguate(entries.filter((e) => kept.has(e.place)));
  return deduped.sort((a, b) => a.id.localeCompare(b.id));
}
