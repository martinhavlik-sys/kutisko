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

/** Názov pre ihrisko bez mena: podľa parku, ulice alebo všeobecný. */
export function displayName(tags, parkName) {
  const own = tags["name:sk"] || tags.name;
  if (own) {
    return /ihrisk|playground|park|hrisk/i.test(own) ? own : `Ihrisko ${own}`;
  }
  if (parkName) return `Ihrisko v parku ${parkName.replace(/^park\s+/i, "")}`;
  if (tags["addr:street"]) return `Ihrisko, ${tags["addr:street"]}`;
  return "Detské ihrisko";
}

/**
 * Prevod jedného ihriska na záznam aplikácie.
 * @param el prvok leisure=playground
 * @param ctx { area, parkName, equipment: Set<string>, amenities: Set<string>, timestamp }
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
    name: displayName(t, ctx.parkName),
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
 */
export function buildPlaces({ playgroundEls, featureEls, parkEls, adminEls }) {
  const adminPolys = adminEls.map(makePolygon).filter(Boolean);
  const parkPolys = parkEls.filter((p) => p.tags?.name).map(makePolygon).filter(Boolean);

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

  const places = [];
  for (const el of candidates) {
    const c = centerOf(el);
    if (!c) continue;
    const park = parkPolys.filter((p) => p.contains(c.lat, c.lon)).sort((a, b) => a.area - b.area)[0];
    places.push(
      toPlace(el, {
        area: pickArea(c.lat, c.lon, adminPolys),
        parkName: park?.el.tags.name ?? null,
        equipment: equipment.get(el),
        amenities: amenities.get(el),
      }),
    );
  }

  // Duplicity: ihrisko zakreslené bodom aj plochou — bod ležiaci v ploche iného ihriska (alebo do 15 m od nej) sa vynechá.
  const polyList = [...polys.values()];
  const deduped = places.filter((p) => {
    if (p.osm.type !== "node") return true;
    return !polyList.some(
      (poly) => poly.contains(p.lat, p.lng) || metersBetween(centerOf(poly.el), { lat: p.lat, lon: p.lng }) <= 15,
    );
  });

  return deduped.sort((a, b) => a.id.localeCompare(b.id));
}
