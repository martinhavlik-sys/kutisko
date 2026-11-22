"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Place } from "@/data/places";
import { addReview, useMyReviews } from "@/lib/community";
import { hasErrors, REVIEW_TEXT_MAX, validateReview, type ReviewInput } from "@/lib/validation";
import { scoreLabel } from "@/lib/search";
import { DemoNotice, FieldError, FormHeader, PhotoPicker, primaryBtn, ScoreScale, secondaryBtn, SuccessPanel } from "@/components/forms/FormParts";

export function ReviewForm({ place }: { place: Place }) {
  const [mine] = useMyReviews();
  const existing = mine.find((r) => r.placeId === place.id);
  const [overall, setOverall] = useState<number | null>(existing?.overall ?? null);
  const [cleanliness, setCleanliness] = useState<number | null>(existing?.cleanliness ?? null);
  const [creativity, setCreativity] = useState<number | null>(existing?.creativity ?? null);
  const [text, setText] = useState(existing?.text ?? "");
  const [photo, setPhoto] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const input: ReviewInput = { overall, cleanliness, creativity, text, hasPhoto: !!photo, photoConsent: consent };
  const errors = submitted ? validateReview(input) : {};

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-16 sm:px-8">
        <FormHeader title="Ďakujeme za hodnotenie" subtitle={place.name} />
        <SuccessPanel
          title="Hodnotenie je uložené (DEMO)"
          actions={
            <>
              <Link href={`/miesto/${place.id}`} className={primaryBtn}>
                Späť na miesto
              </Link>
              <Link href="/profil" className={secondaryBtn}>
                Môj profil
              </Link>
            </>
          }
        >
          <p>
            V skutočnej aplikácii by sa hodnotenie po základnej kontrole zverejnilo. V prototype je uložené iba v tomto prehliadači a
            nikam sa neodoslalo.
          </p>
          {photo && <p className="mt-2">Fotka čaká na schválenie administrátorom (vidno ju v náhľade admin fronty).</p>}
        </SuccessPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-36 sm:px-8">
      <FormHeader title={existing ? "Upraviť hodnotenie" : "Ohodnotiť miesto"} subtitle={place.name} />
      <form
        ref={formRef}
        noValidate
        className="mt-5 space-y-7"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          const errs = validateReview(input);
          if (hasErrors(errs)) {
            // Fokus na prvé chybné pole.
            window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], fieldset[aria-describedby] input")?.focus(), 0);
            return;
          }
          addReview({
            placeId: place.id,
            overall: overall!,
            cleanliness,
            creativity,
            text: text.trim(),
            photo: photo ? { dataUrl: photo, status: "pending" } : null,
          });
          setDone(true);
          window.scrollTo({ top: 0 });
        }}
      >
        <DemoNotice>DEMO — hodnotenie sa uloží iba v tomto prehliadači, nikam sa neodošle ani nezverejní.</DemoNotice>

        <div className="space-y-6 rounded-[26px] bg-white p-5 ring-1 ring-line">
          <ScoreScale
            name="overall"
            label="Celkový dojem"
            required
            value={overall}
            onChange={setOverall}
            error={errors.overall}
            hint={overall ? scoreLabel(overall) : "Ako sa vám a deťom páčilo?"}
          />
          <ScoreScale name="cleanliness" label="Čistota priestoru" value={cleanliness} onChange={setCleanliness} error={errors.cleanliness} />
          <ScoreScale name="creativity" label="Kreativita priestoru" value={creativity} onChange={setCreativity} error={errors.creativity} />
        </div>

        <div>
          <label htmlFor="review-text" className="text-[15px] font-semibold text-ink">
            Vaša skúsenosť <span className="ml-1 text-[13px] font-normal text-ink-muted">nepovinné</span>
          </label>
          <textarea
            id="review-text"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={!!errors.text}
            aria-describedby="review-text-count review-text-err"
            placeholder="Čo sa deťom páčilo? Na čo si dať pozor?"
            className="mt-2 w-full resize-y rounded-2xl bg-white px-4 py-3 text-[16px] leading-relaxed text-ink ring-1 ring-line placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-coral-600"
          />
          <p id="review-text-count" className={`mt-1 text-right text-[12.5px] ${text.length > REVIEW_TEXT_MAX ? "text-coral-600" : "text-ink-muted"}`}>
            {text.length} / {REVIEW_TEXT_MAX}
          </p>
          <FieldError id="review-text-err" message={errors.text} />
        </div>

        <PhotoPicker value={photo} onChange={setPhoto} consent={consent} onConsent={setConsent} consentError={errors.photoConsent} />

        {submitted && hasErrors(errors) && (
          <p role="alert" className="rounded-2xl bg-coral-50 px-4 py-3 text-[14px] font-medium text-coral-700">
            Skontrolujte, prosím, označené polia.
          </p>
        )}

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-xl items-center justify-end gap-3 px-5 py-3 sm:px-8">
            <Link href={`/miesto/${place.id}`} className="min-h-12 content-center px-3 text-[15px] font-semibold text-ink underline underline-offset-2">
              Zrušiť
            </Link>
            <button type="submit" className={primaryBtn}>
              {existing ? "Uložiť zmeny" : "Odoslať hodnotenie"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
