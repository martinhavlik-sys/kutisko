import { test } from "node:test";
import assert from "node:assert/strict";
import { firstName, hasErrors, initials, validateLogin, validateRegistration, validateReview, validateSuggestion } from "./validation.ts";

const review = { overall: 8, cleanliness: null, creativity: null, text: "", hasPhoto: false, photoConsent: false };
const sugg = { name: "Kútik Test", category: "kutik" as const, area: "Petržalka", ageMin: "", ageMax: "", description: "", hasPhoto: false, photoConsent: false };

test("hodnotenie: celkové skóre je povinné, kritériá voliteľné", () => {
  assert.equal(hasErrors(validateReview(review)), false);
  assert.ok(validateReview({ ...review, overall: null }).overall);
  assert.ok(validateReview({ ...review, cleanliness: 11 }).cleanliness);
  assert.ok(validateReview({ ...review, text: "x".repeat(1001) }).text);
  assert.ok(validateReview({ ...review, hasPhoto: true }).photoConsent);
});

test("návrh miesta: povinné polia a konkrétne chybové hlášky", () => {
  assert.equal(hasErrors(validateSuggestion(sugg)), false);
  const e = validateSuggestion({ ...sugg, name: " a ", category: null, area: " " });
  assert.match(e.name!, /krátky/);
  assert.ok(e.category && e.area);
  assert.match(validateSuggestion({ ...sugg, ageMin: "6", ageMax: "3" }).age!, /nemôže/);
  assert.ok(validateSuggestion({ ...sugg, ageMin: "abc" }).age);
  assert.ok(validateSuggestion({ ...sugg, hasPhoto: true }).photoConsent);
});

const reg = { name: "Jana Nováková", email: "jana@example.com", password: "dlhe-heslo", terms: true };

test("registrácia (DEMO): meno, e-mail, heslo aspoň 8 znakov a potvrdenie", () => {
  assert.equal(hasErrors(validateRegistration(reg)), false);
  assert.ok(validateRegistration({ ...reg, name: " " }).name);
  assert.ok(validateRegistration({ ...reg, email: "jana@" }).email);
  assert.ok(validateRegistration({ ...reg, password: "kratke" }).password);
  assert.ok(validateRegistration({ ...reg, terms: false }).terms);
});

test("prihlásenie (DEMO): e-mail a heslo sú povinné", () => {
  assert.equal(hasErrors(validateLogin({ email: " jana@example.com ", password: "x" })), false);
  assert.ok(validateLogin({ email: "", password: "x" }).email);
  assert.ok(validateLogin({ email: "jana@example.com", password: "" }).password);
});

test("oslovenie a iniciály", () => {
  assert.equal(firstName("  Jana Nováková "), "Jana");
  assert.equal(initials("Jana Nováková"), "JN");
  assert.equal(initials("martin"), "M");
  assert.equal(initials("  "), "?");
});
