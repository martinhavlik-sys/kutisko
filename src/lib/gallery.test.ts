import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGallery, canAddPhoto, CATALOG_PHOTOS, MAX_PENDING_PER_PLACE, photosLabel, type PlacePhoto } from "./gallery.ts";

/** Syntetické testovacie fotky (nie skutočné). */
const photo = (id: string, extra: Partial<PlacePhoto> = {}): PlacePhoto => ({
  id, placeId: "a", src: `data:image/jpeg;base64,${id}`, alt: "Fotka", origin: "parent",
  status: "approved", mine: false, addedAt: "2026-11-20T10:00:00Z", ...extra,
});

test("galéria: zverejnené sú len schválené fotky daného miesta", () => {
  const v = buildGallery("a", [[
    photo("1"),
    photo("2", { status: "pending", mine: true }),
    photo("3", { status: "rejected", mine: true }),
    photo("4", { placeId: "b" }),
    photo("5", { status: "pending", mine: false }),
  ]]);
  assert.deepEqual(v.published.map((p) => p.id), ["1"]);
  assert.deepEqual(v.mineUnpublished.map((p) => p.id).sort(), ["2", "3"], "cudzie čakajúce fotky nevidno");
});

test("galéria: fotky prevádzky pred rodičovskými, potom najnovšie; bez duplicít", () => {
  const v = buildGallery("a", [
    [photo("old", { addedAt: "2026-11-01T00:00:00Z" }), photo("op", { origin: "operator", addedAt: "2026-10-01T00:00:00Z" })],
    [photo("new", { addedAt: "2026-11-22T00:00:00Z" }), photo("old")],
  ]);
  assert.deepEqual(v.published.map((p) => p.id), ["op", "new", "old"]);
});

test("galéria: bez fotiek je prázdna (katalóg zatiaľ nemá fotky)", () => {
  assert.equal(CATALOG_PHOTOS.length, 0);
  const v = buildGallery("a", [CATALOG_PHOTOS]);
  assert.equal(v.published.length, 0);
  assert.equal(canAddPhoto(v), true);
});

test("galéria: limit čakajúcich fotiek na miesto", () => {
  const pending = Array.from({ length: MAX_PENDING_PER_PLACE }, (_, i) => photo(`p${i}`, { status: "pending", mine: true }));
  assert.equal(canAddPhoto(buildGallery("a", [pending])), false);
  assert.equal(canAddPhoto(buildGallery("a", [pending.slice(1)])), true);
});

test("galéria: skloňovanie počtu fotiek", () => {
  assert.equal(photosLabel(1), "1 fotka");
  assert.equal(photosLabel(3), "3 fotky");
  assert.equal(photosLabel(5), "5 fotiek");
  assert.equal(photosLabel(0), "0 fotiek");
});
