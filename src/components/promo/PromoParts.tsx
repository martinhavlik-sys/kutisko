"use client";

import Link from "next/link";
import { CATEGORIES, type CategoryId } from "@/data/places";
import { PROMO_PLACES, promoPlaceName } from "@/data/promoDemo";
import { eventDayLabel, monthShort, upcomingEvents, type PromoPlace } from "@/lib/promo";
import { useAllDemoEvents, usePromoDemo, useToday } from "@/lib/promoDemo";
import { formatAge } from "@/lib/search";
import { PlaceArt } from "@/components/home/PlaceArt";
import { ClockIcon } from "@/components/home/icons";

/** Štítok „Sponzorované“ — vždy čitateľný text, nie len farba (rodič musí reklamu spoznať na prvý pohľad). */
export function SponsoredLabel() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-ink ring-1 ring-ink/10 backdrop-blur">
      Sponzorované
    </span>
  );
}

export function DemoLabel({ children = "Ukážka" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-700">
      {children}
    </span>
  );
}

/** Sponzorované miesto nad zoznamom (UKÁŽKA, vymyslená prevádzka). */
export function SponsoredCard({ place }: { place: PromoPlace }) {
  const category = CATEGORIES.find((c) => c.id === place.category)!;
  return (
    <article className="group relative rounded-[26px] bg-white p-2 shadow-card ring-1 ring-line transition-shadow hover:shadow-float">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[20px]">
        <PlaceArt id={place.id} category={place.category} />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <SponsoredLabel />
        </div>
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {category.shortLabel}
        </span>
      </div>
      <div className="px-2 pb-2 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">
            <Link
              href="/pre-prevadzky"
              className="after:absolute after:inset-0 after:rounded-[26px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
            >
              {place.name}
            </Link>
          </h3>
          <DemoLabel />
        </div>
        <p className="mt-0.5 text-[14px] text-ink-muted">{place.tagline}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5 text-[13px]" aria-label="Základné údaje">
          <li className="rounded-full bg-cream-100 px-2.5 py-1 text-ink">Vek {formatAge(place.ageMin, place.ageMax)}</li>
          <li className="rounded-full bg-cream-100 px-2.5 py-1 text-ink-muted">Vymyslená prevádzka</li>
        </ul>
        <p className="mt-3 text-[12.5px] font-medium text-ink-muted">Platená pozícia · nemá vplyv na hodnotenia ani poradie ostatných miest</p>
      </div>
    </article>
  );
}

/** Pás „Akcie v najbližších dňoch“ (UKÁŽKA). Pri zvolenej kategórii ukáže len jej akcie. */
export function EventsRail({ category, onHide }: { category: CategoryId | null; onHide: () => void }) {
  const today = useToday();
  const all = useAllDemoEvents(today);
  const { on } = usePromoDemo();
  if (!on || !today) return null;

  const cat = (placeId: string) => PROMO_PLACES.find((p) => p.id === placeId)?.category;
  const events = upcomingEvents(all, today).filter((e) => !category || cat(e.placeId) === category);
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="events-title" className="mt-8">
      <h2 id="events-title" className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink">
        Akcie v najbližších dňoch
      </h2>
      <div className="mt-0.5 flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-1.5 text-[14px] text-ink-muted">
          <DemoLabel /> <span className="truncate max-[359px]:hidden">vymyslené akcie na ukážku</span>
        </p>
        <button
          type="button"
          onClick={onHide}
          className="-mr-3 min-h-11 shrink-0 rounded-full px-3 text-[14px] font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-ink"
        >
          Skryť ukážku
        </button>
      </div>

      <ul className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8" aria-label="Ukážkové akcie">
        {events.map((e) => (
          <li key={e.id} className="w-[244px] shrink-0 snap-start">
            <Link
              href="/pre-prevadzky#akcie"
              className="flex h-full gap-3 rounded-[22px] bg-white p-3 shadow-card ring-1 ring-line transition hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <span aria-hidden="true" className="flex w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-coral-50 py-2 text-coral-600">
                <span className="font-display text-[20px] font-bold leading-none">{Number(e.date.slice(8, 10))}</span>
                <span className="mt-1 text-[11.5px] font-semibold">{monthShort(e.date)}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-coral-600">{eventDayLabel(e.date, today)}</span>
                <span className="mt-0.5 block text-[15px] font-semibold leading-snug text-ink">{e.title}</span>
                <span className="mt-1 block truncate text-[13px] text-ink-muted">{promoPlaceName(e.placeId)}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink">
                  {e.time && (
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon size={13} />
                      {e.time}
                    </span>
                  )}
                  {e.addedByYou ? <DemoLabel>Pridali ste vy</DemoLabel> : <DemoLabel />}
                </span>
              </span>
            </Link>
          </li>
        ))}
        <li className="w-[170px] shrink-0 snap-start">
          <Link
            href="/pre-prevadzky#pridat"
            className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1 rounded-[22px] border-2 border-dashed border-line px-3 text-center text-[14px] font-semibold text-ink-muted transition hover:border-ink-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span aria-hidden="true" className="text-[22px] leading-none">+</span>
            Pridať akciu
            <span className="text-[12px] font-medium">pre prevádzky</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

/** Jediný prepínač celej ukážky (Profil, stránka pre prevádzky). */
export function PromoToggle({ onChange }: { onChange?: (on: boolean) => void }) {
  const { on, setOn } = usePromoDemo();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p id="promo-toggle-label" className="text-[15px] font-semibold text-ink">
          Ukážka: sponzorované miesta a akcie
        </p>
        <p id="promo-toggle-hint" className="mt-0.5 text-[13px] text-ink-muted">
          Nápad na neskôr. Vymyslené prevádzky a akcie, jasne označené.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="promo-toggle-label"
        aria-describedby="promo-toggle-hint"
        onClick={() => {
          setOn(!on);
          onChange?.(!on);
        }}
        className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          on ? "bg-turquoise-700" : "bg-cream-200 ring-1 ring-inset ring-ink-subtle/40"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 size-6 rounded-full bg-white shadow transition-[left] ${on ? "left-[24px]" : "left-1"}`}
        />
      </button>
    </div>
  );
}
