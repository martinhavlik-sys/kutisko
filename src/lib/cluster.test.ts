import { test } from "node:test";
import assert from "node:assert/strict";
import { clusterPoints } from "./cluster.ts";

test("blízke body tvoria zhluk, osamotené ostávajú pinom", () => {
  const items = clusterPoints(
    [
      { id: "a", x: 10, y: 10 },
      { id: "b", x: 20, y: 30 },
      { id: "c", x: 200, y: 200 },
    ],
    50,
  );
  const cluster = items.find((i) => i.kind === "cluster");
  assert.ok(cluster && cluster.kind === "cluster");
  assert.deepEqual(cluster.ids, ["a", "b"]);
  assert.equal(cluster.x, 10, "stred zhluku je prvý bod (kotva)");
  assert.ok(items.some((i) => i.kind === "pin" && i.id === "c"));
});

test("vybrané miesto sa nikdy nezhlukuje", () => {
  const items = clusterPoints(
    [
      { id: "a", x: 10, y: 10 },
      { id: "b", x: 12, y: 12 },
    ],
    50,
    "a",
  );
  assert.deepEqual(
    items.map((i) => (i.kind === "pin" ? i.id : "cluster")).sort(),
    ["a", "b"],
  );
});

test("stredy zhlukov sú od seba aspoň o polomer", () => {
  const pts = Array.from({ length: 200 }, (_, i) => ({ id: String(i), x: (i * 37) % 300, y: (i * 53) % 300 }));
  const items = clusterPoints(pts, 60);
  const centers = items.filter((i) => i.kind === "cluster").map((c) => c as { x: number; y: number });
  for (let a = 0; a < centers.length; a++)
    for (let b = a + 1; b < centers.length; b++)
      assert.ok(Math.hypot(centers[a].x - centers[b].x, centers[a].y - centers[b].y) >= 60);
  const total = items.reduce((s, i) => s + (i.kind === "pin" ? 1 : i.ids.length), 0);
  assert.equal(total, 200);
});
