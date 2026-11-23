import { test } from "node:test";
import assert from "node:assert/strict";
import { navigationUrl, navTargetOf } from "./navigation.ts";

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

test("pri približnej polohe naviguje na adresu", () => {
  const target = navTargetOf({ ...t, web: { address: "Nevädzová 6, Bratislava", approxPosition: true } });
  assert.equal(new URL(navigationUrl("google", target)).searchParams.get("destination"), "Nevädzová 6, Bratislava");
  assert.equal(new URL(navigationUrl("apple", target)).searchParams.get("daddr"), "Nevädzová 6, Bratislava");
  assert.equal(new URL(navigationUrl("waze", target)).searchParams.get("q"), "Nevädzová 6, Bratislava");
  const exact = navTargetOf({ ...t, web: { address: "x", approxPosition: false } });
  assert.equal(new URL(navigationUrl("google", exact)).searchParams.get("destination"), "48.145200,17.112500");
});
