import { test } from "node:test";
import assert from "node:assert/strict";
import { navigationUrl } from "./navigation.ts";

const t = { lat: 48.1452, lng: 17.1125, name: "Kútik & Kocky" };

test("Apple Maps URL s cieľom a bezpečne kódovaným názvom", () => {
  const u = new URL(navigationUrl("apple", t));
  assert.equal(u.hostname, "maps.apple.com");
  assert.equal(u.searchParams.get("daddr"), "48.145200,17.112500");
  assert.equal(u.searchParams.get("q"), "Kútik & Kocky");
});

test("Google Maps URL podľa oficiálneho Maps URLs API", () => {
  const u = new URL(navigationUrl("google", t));
  assert.equal(u.pathname, "/maps/dir/");
  assert.equal(u.searchParams.get("api"), "1");
  assert.equal(u.searchParams.get("destination"), "48.145200,17.112500");
});

test("Waze URL s navigate=yes", () => {
  const u = new URL(navigationUrl("waze", t));
  assert.equal(u.hostname, "waze.com");
  assert.equal(u.searchParams.get("ll"), "48.145200,17.112500");
  assert.equal(u.searchParams.get("navigate"), "yes");
});
