/**
 * Jednoduché zhlukovanie pinov podľa mriežky na obrazovke (bez ďalšej závislosti).
 * Vstup sú už premietnuté body v pixeloch; body v jednej bunke mriežky tvoria zhluk.
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

export function clusterPoints(points: ScreenPoint[], cellPx: number, keepId: string | null = null): ClusterItem[] {
  const cells = new Map<string, ScreenPoint[]>();
  const out: ClusterItem[] = [];
  for (const p of points) {
    if (p.id === keepId) {
      out.push({ kind: "pin", id: p.id });
      continue;
    }
    const key = `${Math.floor(p.x / cellPx)}:${Math.floor(p.y / cellPx)}`;
    const cell = cells.get(key);
    if (cell) cell.push(p);
    else cells.set(key, [p]);
  }
  for (const [key, members] of cells) {
    if (members.length === 1) {
      out.push({ kind: "pin", id: members[0].id });
      continue;
    }
    const x = members.reduce((s, m) => s + m.x, 0) / members.length;
    const y = members.reduce((s, m) => s + m.y, 0) / members.length;
    out.push({ kind: "cluster", key, ids: members.map((m) => m.id).sort(), x, y });
  }
  return out;
}
