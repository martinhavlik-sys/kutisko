"use client";

import Link from "next/link";
import { useState } from "react";
import { PROMO_PLACES, promoPlaceName } from "@/data/promoDemo";
import { addDays, EVENT_WINDOW_DAYS, eventDayLabel, upcomingEvents, validateEvent, type EventInput } from "@/lib/promo";
import { useAddedEvents, useAllDemoEvents, usePromoDemo, useToday } from "@/lib/promoDemo";
import { demoId } from "@/lib/demoStore";
import { DemoNotice, FieldError, FormHeader, primaryBtn } from "@/components/forms/FormParts";
import { Toast, useToast } from "@/components/ui/Toast";
import { DemoLabel, PromoToggle, SponsoredCard } from "./PromoParts";

const inputCls =
  "mt-2 w-full rounded-2xl bg-white px-4 text-[16px] text-ink ring-1 ring-line placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-coral-600";

const RULES = [
  "Každá platená pozícia má viditeľný štítok „Sponzorované“.",
  "Najviac jedno sponzorované miesto nad zoznamom a len vtedy, keď zodpovedá tomu, čo rodič hľadá (kategória, vek).",
  "Sponzorstvo nemení hodnotenia rodičov, poradie ostatných miest ani filtre.",
  `Akcie sa ukazujú najviac ${EVENT_WINDOW_DAYS} dní dopredu a pred zverejnením ich skontrolujeme.`,
  "Rodič si ukážku aj neskoršie akcie vie skryť.",
];

const EMPTY: EventInput = { title: "", date: "", time: "", note: "" };

export function BusinessDemoScreen() {
  const today = useToday();
  const all = useAllDemoEvents(today);
  const [, setAdded] = useAddedEvents();
  const { on } = usePromoDemo();
  const { message, show } = useToast();

  const [placeId, setPlaceId] = useState(PROMO_PLACES[0].id);
  const [form, setForm] = useState<EventInput>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted && today ? validateEvent(form, today) : {};
  const errCount = Object.keys(errors).length;
  const events = today ? upcomingEvents(all, today) : [];

  const field = (k: keyof EventInput) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value })),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `ev-${k}-err` : undefined,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateEvent(form, today);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`ev-${first}`)?.focus();
      return;
    }
    setAdded((prev) => [
      {
        id: demoId("akcia"),
        placeId,
        title: form.title.trim(),
        date: form.date,
        time: form.time.trim() || null,
        note: form.note.trim() || null,
        addedByYou: true,
      },
      ...prev,
    ]);
    setForm(EMPTY);
    setSubmitted(false);
    show(on ? "Akcia pridaná (ukážka). Nájdete ju na Domove." : "Akcia pridaná. Ukážka je vypnutá, zapnete ju nižšie.");
  };

  return (
    <>
      <div className="mx-auto max-w-xl px-5 pb-24 sm:px-8">
        <FormHeader title="Pre prevádzky" subtitle="Ukážka nápadu · nič sa neplatí ani neodosiela" />

        <main className="mt-5 space-y-9">
          <DemoNotice>
            Toto je <strong>ukážka nápadu</strong> na neskôr: herne a kútiky by si mohli zaplatiť miesto vpredu a pridávať akcie na
            najbližšie dni. Prevádzky aj akcie sú vymyslené. Ceny a pravidlá zatiaľ nie sú rozhodnuté.
          </DemoNotice>

          <section aria-labelledby="see-title">
            <h2 id="see-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              Čo uvidia rodičia
            </h2>
            <p className="mt-1 text-[14.5px] leading-relaxed text-ink-muted">
              Na Domove nad zoznamom miest jedno sponzorované miesto so štítkom a pod mapou pás „Akcie v najbližších dňoch“.
            </p>
            <div className="mt-4">
              <SponsoredCard place={PROMO_PLACES[0]} />
            </div>
          </section>

          <section aria-labelledby="rules-title">
            <h2 id="rules-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              Zásady, aby reklama nezavádzala <span className="align-middle"><DemoLabel>Návrh</DemoLabel></span>
            </h2>
            <ul className="mt-3 space-y-2.5">
              {RULES.map((r) => (
                <li key={r} className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-turquoise-700" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section id="akcie" aria-labelledby="events-list-title" className="scroll-mt-24">
            <h2 id="events-list-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              Akcie v najbližších dňoch
            </h2>
            {!today ? (
              <p className="mt-3 text-[14px] text-ink-muted">Načítavam…</p>
            ) : (
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
                {events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-coral-600">
                        {eventDayLabel(e.date, today)}
                        {e.time ? ` · ${e.time}` : ""}
                      </p>
                      <p className="text-[15px] font-semibold text-ink">{e.title}</p>
                      <p className="text-[13px] text-ink-muted">
                        {promoPlaceName(e.placeId)}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                    </div>
                    {e.addedByYou ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAdded((prev) => prev.filter((x) => x.id !== e.id));
                          show("Akcia odstránená");
                        }}
                        aria-label={`Odstrániť akciu ${e.title}`}
                        className="min-h-10 shrink-0 rounded-full px-3 text-[13.5px] font-semibold text-coral-600 ring-1 ring-line hover:ring-coral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        Odstrániť
                      </button>
                    ) : (
                      <DemoLabel />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="pridat" aria-labelledby="add-title" className="scroll-mt-24">
            <h2 id="add-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              Pridať akciu <span className="align-middle"><DemoLabel /></span>
            </h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              Takto by to vyzeralo pre prevádzku. Uloží sa len v tomto prehliadači.
            </p>

            <form noValidate onSubmit={submit} className="mt-4 space-y-5 rounded-[26px] bg-white p-5 ring-1 ring-line">
              {submitted && errCount > 0 && (
                <p role="alert" className="rounded-2xl bg-coral-50 px-4 py-3 text-[14px] font-medium text-coral-700">
                  Skontrolujte, prosím, {errCount === 1 ? "1 pole" : `${errCount} polia`}.
                </p>
              )}
              <div>
                <label htmlFor="ev-place" className="text-[15px] font-semibold text-ink">
                  Prevádzka
                </label>
                <select id="ev-place" value={placeId} onChange={(e) => setPlaceId(e.target.value)} className={`${inputCls} min-h-12 appearance-none`}>
                  {PROMO_PLACES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ev-title" className="text-[15px] font-semibold text-ink">
                  Názov akcie
                </label>
                <input id="ev-title" type="text" maxLength={80} placeholder="napr. Maľovanie na tvár" className={`${inputCls} min-h-12`} {...field("title")} />
                <FieldError id="ev-title-err" message={errors.title} />
              </div>
              <div className="grid gap-5 min-[420px]:grid-cols-2">
                <div>
                  <label htmlFor="ev-date" className="text-[15px] font-semibold text-ink">
                    Deň
                  </label>
                  <input
                    id="ev-date"
                    type="date"
                    min={today || undefined}
                    max={today ? addDays(today, EVENT_WINDOW_DAYS) : undefined}
                    className={`${inputCls} min-h-12`}
                    {...field("date")}
                  />
                  <FieldError id="ev-date-err" message={errors.date} />
                </div>
                <div>
                  <label htmlFor="ev-time" className="text-[15px] font-semibold text-ink">
                    Čas <span className="text-[13px] font-normal text-ink-muted">nepovinné</span>
                  </label>
                  <input id="ev-time" type="text" inputMode="numeric" placeholder="10:00 – 12:00" className={`${inputCls} min-h-12`} {...field("time")} />
                  <FieldError id="ev-time-err" message={errors.time} />
                </div>
              </div>
              <div>
                <label htmlFor="ev-note" className="text-[15px] font-semibold text-ink">
                  Krátka poznámka <span className="text-[13px] font-normal text-ink-muted">nepovinné</span>
                </label>
                <input id="ev-note" type="text" maxLength={140} placeholder="napr. V cene vstupu" className={`${inputCls} min-h-12`} {...field("note")} />
                <FieldError id="ev-note-err" message={errors.note} />
              </div>
              <button type="submit" disabled={!today} className={`${primaryBtn} w-full`}>
                Pridať akciu
              </button>
            </form>
          </section>

          <section aria-label="Zapnutie ukážky" className="rounded-[26px] bg-white p-5 ring-1 ring-line">
            <PromoToggle onChange={(v) => show(v ? "Ukážka zapnutá" : "Ukážka vypnutá, rodičia ju neuvidia")} />
          </section>

          <p className="text-center text-[13px] text-ink-muted">
            <Link href="/" className="font-semibold text-coral-600 underline-offset-2 hover:underline">
              Späť na Domov
            </Link>
          </p>
        </main>
      </div>
      <Toast message={message} offset={24} />
    </>
  );
}
