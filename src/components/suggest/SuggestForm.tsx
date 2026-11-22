"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CATEGORIES, type CategoryId } from "@/data/places";
import { addSuggestion } from "@/lib/community";
import { hasErrors, validateSuggestion, type SuggestionInput } from "@/lib/validation";
import { DemoNotice, FieldError, FormHeader, PhotoPicker, primaryBtn, secondaryBtn, SuccessPanel } from "@/components/forms/FormParts";

const inputCls =
  "mt-2 w-full rounded-2xl bg-white px-4 text-[16px] text-ink ring-1 ring-line placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-coral-600";

export function SuggestForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [area, setArea] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const input: SuggestionInput = { name, category, area, ageMin, ageMax, description, hasPhoto: !!photo, photoConsent: consent };
  const errors = submitted ? validateSuggestion(input) : {};
  const errCount = Object.keys(errors).length;

  const reset = () => {
    setName("");
    setCategory(null);
    setArea("");
    setAgeMin("");
    setAgeMax("");
    setDescription("");
    setPhoto(null);
    setConsent(false);
    setSubmitted(false);
    setDone(null);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-16 sm:px-8">
        <FormHeader title="Ďakujeme za návrh" />
        <SuccessPanel
          title="Návrh čaká na schválenie (DEMO)"
          actions={
            <>
              <Link href="/admin" className={primaryBtn}>
                Pozrieť admin frontu
              </Link>
              <button type="button" onClick={reset} className={secondaryBtn}>
                Navrhnúť ďalšie
              </button>
            </>
          }
        >
          <p>
            „{done}“ sa v skutočnej aplikácii zverejní až po kontrole administrátorom. V prototype je návrh uložený iba v tomto
            prehliadači a nikam sa neodoslal.
          </p>
        </SuccessPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-36 sm:px-8">
      <FormHeader title="Navrhnúť nové miesto" subtitle="Pomôžte ostatným rodičom" />
      <form
        ref={formRef}
        noValidate
        className="mt-5 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          const errs = validateSuggestion(input);
          if (hasErrors(errs)) {
            window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid='true']")?.focus(), 0);
            return;
          }
          addSuggestion({
            name: name.trim(),
            category: category!,
            area: area.trim(),
            ageMin: ageMin ? Number(ageMin) : null,
            ageMax: ageMax ? Number(ageMax) : null,
            description: description.trim(),
            photo: photo ? { dataUrl: photo, status: "pending" } : null,
          });
          setDone(name.trim());
          window.scrollTo({ top: 0 });
        }}
      >
        <DemoNotice>DEMO — návrh sa uloží iba v tomto prehliadači a zobrazí sa v náhľade admin fronty. Nič sa nezverejní.</DemoNotice>

        {submitted && errCount > 0 && (
          <p role="alert" className="rounded-2xl bg-coral-50 px-4 py-3 text-[14px] font-medium text-coral-700">
            {errCount === 1 ? "Jedno pole treba opraviť." : errCount <= 4 ? `${errCount} polia treba opraviť.` : `${errCount} polí treba opraviť.`} Nič sa nestratilo, stačí doplniť označené údaje.
          </p>
        )}

        <div>
          <label htmlFor="s-name" className="text-[15px] font-semibold text-ink">
            Názov miesta
          </label>
          <input
            id="s-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "s-name-err" : undefined}
            autoComplete="off"
            placeholder="napr. Kútik v kaviarni na rohu"
            className={`${inputCls} h-12`}
          />
          <FieldError id="s-name-err" message={errors.name} />
        </div>

        <fieldset aria-describedby={errors.category ? "s-cat-err" : undefined}>
          <legend className="text-[15px] font-semibold text-ink">Typ miesta</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <label key={c.id} className="relative">
                <input
                  type="radio"
                  name="category"
                  checked={category === c.id}
                  onChange={() => setCategory(c.id)}
                  data-invalid={!!errors.category}
                  className="peer sr-only"
                />
                <span className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-white px-3 text-[15px] font-medium text-ink ring-1 ring-line transition peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-data-[invalid=true]:ring-2 peer-data-[invalid=true]:ring-coral-600">
                  {c.label}
                </span>
              </label>
            ))}
          </div>
          <FieldError id="s-cat-err" message={errors.category} />
        </fieldset>

        <div>
          <label htmlFor="s-area" className="text-[15px] font-semibold text-ink">
            Adresa alebo mestská časť
          </label>
          <input
            id="s-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            aria-invalid={!!errors.area}
            aria-describedby={errors.area ? "s-area-err" : undefined}
            placeholder="napr. Petržalka, Romanova ulica"
            className={`${inputCls} h-12`}
          />
          <FieldError id="s-area-err" message={errors.area} />
        </div>

        <fieldset aria-describedby={errors.age ? "s-age-err" : undefined}>
          <legend className="text-[15px] font-semibold text-ink">
            Vhodný vek <span className="ml-1 text-[13px] font-normal text-ink-muted">nepovinné</span>
          </legend>
          <div className="mt-2 flex items-center gap-3">
            <label className="sr-only" htmlFor="s-agemin">
              Vek od
            </label>
            <input
              id="s-agemin"
              inputMode="numeric"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              aria-invalid={!!errors.age}
              placeholder="od"
              className={`${inputCls} mt-0 h-12 w-24 text-center`}
            />
            <span className="text-ink-muted">–</span>
            <label className="sr-only" htmlFor="s-agemax">
              Vek do
            </label>
            <input
              id="s-agemax"
              inputMode="numeric"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              aria-invalid={!!errors.age}
              placeholder="do"
              className={`${inputCls} mt-0 h-12 w-24 text-center`}
            />
            <span className="text-[15px] text-ink-muted">rokov</span>
          </div>
          <FieldError id="s-age-err" message={errors.age} />
        </fieldset>

        <div>
          <label htmlFor="s-desc" className="text-[15px] font-semibold text-ink">
            Krátky popis <span className="ml-1 text-[13px] font-normal text-ink-muted">nepovinné</span>
          </label>
          <textarea
            id="s-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "s-desc-err" : undefined}
            placeholder="Čo tam deti nájdu? Je tam kaviareň, parkovanie…"
            className={`${inputCls} py-3 leading-relaxed`}
          />
          <FieldError id="s-desc-err" message={errors.description} />
        </div>

        <PhotoPicker value={photo} onChange={setPhoto} consent={consent} onConsent={setConsent} consentError={errors.photoConsent} />

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-xl items-center justify-end gap-3 px-5 py-3 sm:px-8">
            <Link href="/profil" className="min-h-12 content-center px-3 text-[15px] font-semibold text-ink underline underline-offset-2">
              Zrušiť
            </Link>
            <button type="submit" className={primaryBtn}>
              Odoslať návrh
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
