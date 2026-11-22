/**
 * Jednoduché zhlukovanie pinov na obrazovke (bez ďalšej závislosti).
 * Vstup sú už premietnuté body v pixeloch.
 * Vybrané miesto sa nikdy nezhlukuje, aby bolo vždy vidieť.
 */
export interface ScreenPoint {
  id: string;
  x: number;
  y: number;
}

export type ClusterItem =
  | { kind: "pin"; id: string }
  | { kind: "cluster"; key: string; ids: string[]; x: number; y: number };

/**
 * Chamtivé zhlukovanie podľa vzdialenosti: bod sa pridá k prvému zhluku, ktorého stred je bližšie
 * ako `radiusPx`, inak založí nový. Stredy zhlukov sú tak od seba aspoň ~radiusPx a kruhy sa neprekrývajú.
 */
export function clusterPoints(points: ScreenPoint[], radiusPx: number, keepId: string | null = null): ClusterItem[] {
  const groups: { x: number; y: number; members: ScreenPoint[] }[] = [];
  const out: ClusterItem[] = [];
  const r2 = radiusPx * radiusPx;
  for (const p of points) {
    if (p.id === keepId) {
      out.push({ kind: "pin", id: p.id });
      continue;
    }
    const g = groups.find((c) => (c.x - p.x) ** 2 + (c.y - p.y) ** 2 < r2);
    if (g) g.members.push(p);
    else groups.push({ x: p.x, y: p.y, members: [p] });
  }
  for (const g of groups) {
    if (g.members.length === 1) {
      out.push({ kind: "pin", id: g.members[0].id });
      continue;
    }
    const ids = g.members.map((m) => m.id).sort();
    out.push({ kind: "cluster", key: ids.join(","), ids, x: g.x, y: g.y });
  }
  return out;
}
