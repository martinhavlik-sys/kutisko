"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { CATEGORIES, REFERENCE_POINT, type Place } from "@/data/places";
import { distanceKm, formatAge, formatDistance, formatPrice, formatScore, reviewsLabel } from "@/lib/search";
import { CheckBadgeIcon, ClockIcon, HeartIcon, StarIcon } from "./icons";
import { PlaceArt } from "./PlaceArt";

interface Props {
  place: Place;
  saved: boolean;
  active: boolean;
  onToggleSave: (id: string) => void;
}

export const PlaceCard = forwardRef<HTMLElement, Props>(function PlaceCard(
  { place, saved, active, onToggleSave },
  ref,
) {
  const category = CATEGORIES.find((c) => c.id === place.category)!;
  const km = distanceKm(REFERENCE_POINT, place);

  return (
    <article
      ref={ref}
      className={`group relative rounded-[26px] bg-white p-2 shadow-card ring-1 transition-[box-shadow,transform] duration-200 ${
        active ? "ring-2 ring-coral-500" : "ring-line hover:shadow-float"
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-[20px]">
        <PlaceArt id={place.id} category={place.category} />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink backdrop-blur">
          DEMO
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {category.shortLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onToggleSave(place.id)}
        aria-pressed={saved}
        aria-label={saved ? `Odstrániť ${place.name} z obľúbených` : `Uložiť ${place.name} do obľúbených`}
        className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <HeartIcon size={20} filled={saved} className={saved ? "text-coral-500" : "text-ink"} />
      </button>

      <div className="px-2 pb-2 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">
            <Link
              href={`/miesto/${place.id}`}
              className="after:absolute after:inset-0 after:rounded-[26px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
            >
              {place.name}
            </Link>
          </h3>
          {place.score !== null ? (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[13px] font-semibold text-amber-700">
              <StarIcon size={14} className="text-amber-400" />
              <span>
                {formatScore(place.score)}
                <span className="sr-only"> z 10</span>
              </span>
            </div>
          ) : (
            <span className="shrink-0 rounded-full bg-turquoise-50 px-2 py-1 text-[12px] font-semibold text-turquoise-700">
              Nové
            </span>
          )}
        </div>

        <p className="mt-0.5 text-[14px] text-ink-muted">
          {place.area} · {formatDistance(km)} od {REFERENCE_POINT.label}
          {" · "}
          {place.score !== null ? reviewsLabel(place.reviewCount) : "zatiaľ bez hodnotení"}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5 text-[13px]" aria-label="Základné údaje">
          <li className="rounded-full bg-cream-100 px-2.5 py-1 text-ink">Vek {formatAge(place.ageMin, place.ageMax)}</li>
          <li className={`rounded-full bg-cream-100 px-2.5 py-1 ${place.price.kind === "unknown" ? "text-ink-muted" : "text-ink"}`}>
            {formatPrice(place.price)}
          </li>
          <li className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-ink-muted">
            <ClockIcon size={14} />
            {place.hoursToday ? <span className="text-ink">Dnes {place.hoursToday}</span> : "Hodiny neoverené"}
          </li>
        </ul>

        <p
          className={`mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium ${
            place.verified ? "text-turquoise-700" : "text-ink-muted"
          }`}
        >
          {place.verified ? (
            <>
              <CheckBadgeIcon size={16} /> Údaje overené kurátorom (simulované)
            </>
          ) : (
            <>
              <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-ink-subtle" /> Údaje zatiaľ neoverené
            </>
          )}
        </p>
      </div>
    </article>
  );
});

export function PlaceCardSkeleton() {
  return (
    <div className="rounded-[26px] bg-white p-2 shadow-card ring-1 ring-line" aria-hidden="true">
      <div className="skeleton aspect-[16/9] rounded-[20px]" />
      <div className="space-y-2.5 px-2 pb-3 pt-4">
        <div className="skeleton h-4 w-2/3 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
