import type { CategoryId } from "../data/places";

export type Errors<K extends string> = Partial<Record<K, string>>;

export interface ReviewInput {
  overall: number | null;
  cleanliness: number | null;
  creativity: number | null;
  text: string;
  hasPhoto: boolean;
  photoConsent: boolean;
}

export const REVIEW_TEXT_MAX = 1000;

export function validateReview(r: ReviewInput): Errors<"overall" | "cleanliness" | "creativity" | "text" | "photoConsent"> {
  const e: Errors<"overall" | "cleanliness" | "creativity" | "text" | "photoConsent"> = {};
  const inRange = (n: number) => Number.isInteger(n) && n >= 1 && n <= 10;
  if (r.overall === null) e.overall = "Vyberte celkové hodnotenie od 1 do 10.";
  else if (!inRange(r.overall)) e.overall = "Hodnotenie musí byť celé číslo od 1 do 10.";
  if (r.cleanliness !== null && !inRange(r.cleanliness)) e.cleanliness = "Hodnota musí byť od 1 do 10.";
  if (r.creativity !== null && !inRange(r.creativity)) e.creativity = "Hodnota musí byť od 1 do 10.";
  if (r.text.length > REVIEW_TEXT_MAX) e.text = `Text je príliš dlhý, skráťte ho na ${REVIEW_TEXT_MAX} znakov.`;
  if (r.hasPhoto && !r.photoConsent) e.photoConsent = "Potvrďte, prosím, že na fotke nie sú rozpoznateľné deti.";
  return e;
}

export interface SuggestionInput {
  name: string;
  category: CategoryId | null;
  area: string;
  ageMin: string;
  ageMax: string;
  description: string;
  hasPhoto: boolean;
  photoConsent: boolean;
}

type SuggestionKey = "name" | "category" | "area" | "age" | "description" | "photoConsent";

export function validateSuggestion(s: SuggestionInput): Errors<SuggestionKey> {
  const e: Errors<SuggestionKey> = {};
  const name = s.name.trim();
  if (!name) e.name = "Napíšte názov miesta.";
  else if (name.length < 3) e.name = "Názov je príliš krátky, aspoň 3 znaky.";
  else if (name.length > 80) e.name = "Názov je príliš dlhý, najviac 80 znakov.";
  if (!s.category) e.category = "Vyberte, o aký typ miesta ide.";
  if (!s.area.trim()) e.area = "Napíšte adresu alebo aspoň mestskú časť či obec.";
  const min = s.ageMin.trim() === "" ? null : Number(s.ageMin);
  const max = s.ageMax.trim() === "" ? null : Number(s.ageMax);
  const okAge = (n: number | null) => n === null || (Number.isInteger(n) && n >= 0 && n <= 18);
  if (!okAge(min) || !okAge(max)) e.age = "Vek zadajte celým číslom od 0 do 18.";
  else if (min !== null && max !== null && min > max) e.age = "Vek „od“ nemôže byť vyšší ako „do“.";
  if (s.description.length > 600) e.description = "Popis je príliš dlhý, najviac 600 znakov.";
  if (s.hasPhoto && !s.photoConsent) e.photoConsent = "Potvrďte, prosím, že na fotke nie sú rozpoznateľné deti.";
  return e;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;

/* ---------- Simulovaný účet (DEMO) ---------- */

export const PASSWORD_MIN = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
  terms: boolean;
}

type RegistrationKey = "name" | "email" | "password" | "terms";

export function validateRegistration(r: RegistrationInput): Errors<RegistrationKey> {
  const e: Errors<RegistrationKey> = {};
  const name = r.name.trim();
  if (!name) e.name = "Napíšte, ako vás máme oslovovať.";
  else if (name.length < 2) e.name = "Meno je príliš krátke, aspoň 2 znaky.";
  else if (name.length > 40) e.name = "Meno je príliš dlhé, najviac 40 znakov.";
  const email = r.email.trim();
  if (!email) e.email = "Napíšte e-mail.";
  else if (!EMAIL_RE.test(email)) e.email = "E-mail nevyzerá správne, napr. rodic@example.com.";
  if (!r.password) e.password = "Zvoľte heslo.";
  else if (r.password.length < PASSWORD_MIN) e.password = `Heslo musí mať aspoň ${PASSWORD_MIN} znakov.`;
  if (!r.terms) e.terms = "Potvrďte, prosím, že ide o skúšobný DEMO účet.";
  return e;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function validateLogin(l: LoginInput): Errors<"email" | "password"> {
  const e: Errors<"email" | "password"> = {};
  const email = l.email.trim();
  if (!email) e.email = "Napíšte e-mail.";
  else if (!EMAIL_RE.test(email)) e.email = "E-mail nevyzerá správne, napr. rodic@example.com.";
  if (!l.password) e.password = "Napíšte heslo.";
  return e;
}

/** Iniciály pre avatar: „Jana Nováková“ → „JN“, „Martin“ → „M“. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toLocaleUpperCase("sk");
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("sk");
}

/** Oslovenie v uvítaní — prvé slovo mena. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}
