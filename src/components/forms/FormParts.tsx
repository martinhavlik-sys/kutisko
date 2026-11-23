"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { makeDemoThumbnail } from "@/lib/community";
import { CloseIcon } from "@/components/home/icons";

export function FormHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 -mx-5 border-b border-line/70 bg-cream-50/95 px-5 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-xl sm:-mx-8 sm:px-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          aria-label="Späť"
          className="-ml-2 flex size-11 items-center justify-center rounded-full text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-[20px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
          {subtitle && <p className="truncate text-[13.5px] text-ink-muted">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-amber-50 px-4 py-3 text-[13.5px] leading-relaxed text-amber-700">{children}</p>;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13.5px] font-medium text-coral-600">
      <span aria-hidden="true">●</span>
      {message}
    </p>
  );
}

/** Stupnica 1–10 ako skupina prepínačov (klávesnica: šípky). */
export function ScoreScale({
  label,
  hint,
  value,
  onChange,
  error,
  required,
  name,
}: {
  label: string;
  hint?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  error?: string;
  required?: boolean;
  name: string;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined} aria-required={required}>
      <legend className="flex w-full items-baseline justify-between gap-3">
        <span className="text-[15px] font-semibold text-ink">
          {label}
          {!required && <span className="ml-1.5 text-[13px] font-normal text-ink-muted">nepovinné</span>}
        </span>
        <span className="text-[15px] font-bold text-ink" aria-hidden="true">
          {value ?? "–"}
          <span className="text-[13px] font-normal text-ink-muted"> / 10</span>
        </span>
      </legend>
      {hint && <p className="mt-0.5 text-[13px] text-ink-muted">{hint}</p>}
      <div className="mt-2.5 grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = value !== null && n <= value;
          const exact = value === n;
          return (
            <label key={n} className="relative">
              <input
                type="radio"
                name={name}
                value={n}
                checked={exact}
                onChange={() => onChange(n)}
                className="peer sr-only"
                aria-label={`${n} z 10`}
              />
              <span
                className={`flex h-11 cursor-pointer items-center justify-center rounded-xl text-[14px] font-semibold transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
                  exact
                    ? "bg-ink text-white"
                    : active
                      ? "bg-amber-50 text-amber-700"
                      : "bg-white text-ink-muted ring-1 ring-line hover:ring-ink-subtle"
                }`}
              >
                {n}
              </span>
            </label>
          );
        })}
      </div>
      {!required && value !== null && (
        <button type="button" onClick={() => onChange(null)} className="mt-2 text-[13px] font-medium text-ink-muted underline underline-offset-2">
          Zrušiť výber
        </button>
      )}
      <FieldError id={`${id}-err`} message={error} />
    </fieldset>
  );
}

export function PhotoPicker({
  value,
  onChange,
  consent,
  onConsent,
  consentError,
  compact,
}: {
  /** V dialógu „Pridať fotku“ je fotka povinná a pravidlá sú uvedené inde — bez nadpisu. */
  compact?: boolean;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  consent: boolean;
  onConsent: (v: boolean) => void;
  consentError?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  return (
    <div>
      {!compact && (
        <>
          <p className="text-[15px] font-semibold text-ink">
            Fotografia <span className="ml-1 text-[13px] font-normal text-ink-muted">nepovinné</span>
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
            Pred zverejnením ju skontroluje administrátor. Polohu a ďalšie údaje z fotky odstránime.
          </p>
        </>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setError(null);
          setBusy(true);
          try {
            onChange(await makeDemoThumbnail(f));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Fotku sa nepodarilo načítať.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {value ? (
        <div className="mt-3 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- lokálny náhľad (data URL) */}
          <img src={value} alt="Náhľad vybranej fotky" className="size-24 rounded-2xl object-cover ring-1 ring-line" />
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-amber-700">Náhľad iba v tomto prehliadači (DEMO)</span>
            <button type="button" onClick={() => onChange(null)} className="inline-flex min-h-10 items-center gap-1 text-[14px] font-semibold text-ink underline underline-offset-2">
              <CloseIcon size={16} /> Odstrániť fotku
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white text-[14px] font-semibold text-ink transition hover:border-ink-subtle focus-within:outline-2 focus-within:outline-ink"
        >
          {busy ? "Spracúvam fotku…" : "+ Pridať fotku"}
          <span className="mt-0.5 text-[12.5px] font-normal text-ink-muted">JPG alebo PNG, najviac 15 MB</span>
        </label>
      )}
      {error && <FieldError id={`${id}-pick`} message={error} />}
      {value && (
        <div className="mt-3">
          <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-snug text-ink">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => onConsent(e.target.checked)}
              aria-describedby={consentError ? `${id}-consent` : undefined}
              aria-invalid={!!consentError}
              className="mt-0.5 size-5 shrink-0 accent-[var(--color-turquoise-700)]"
            />
            Potvrdzujem, že na fotke nie sú rozpoznateľné deti ani iné osoby a fotku som odfotil/a sám/sama.
          </label>
          <FieldError id={`${id}-consent`} message={consentError} />
        </div>
      )}
    </div>
  );
}

export function SuccessPanel({ title, children, actions }: { title: string; children: React.ReactNode; actions: React.ReactNode }) {
  return (
    <div role="status" className="mt-8 flex flex-col items-center rounded-[26px] bg-white px-6 py-10 text-center shadow-card ring-1 ring-line">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-turquoise-50 text-turquoise-700">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h2 className="text-[20px] font-bold text-ink">{title}</h2>
      <div className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-muted">{children}</div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">{actions}</div>
    </div>
  );
}

export const primaryBtn =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-coral-600 px-6 text-[16px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
export const secondaryBtn =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[16px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
