import { test } from "node:test";
import assert from "node:assert/strict";
import { clusterPoints } from "./cluster.ts";

test("body v jednej bunke tvoria zhluk, osamotené ostávajú pinom", () => {
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
  assert.equal(cluster.x, 15);
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
