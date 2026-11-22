"use client";

import { useState } from "react";
import type { Place } from "@/data/places";
import { placesLabel } from "@/lib/search";
import { PlaceCard } from "./PlaceCard";

const PAGE = 20;

interface Props {
  places: Place[];
  savedHas: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  activeId?: string | null;
  cardRef?: (id: string, el: HTMLElement | null) => void;
}

/**
 * Zoznam kariet po dávkach (20) — skutočných ihrísk sú stovky, vykresliť všetky naraz by bolo pomalé.
 * Vybrané miesto (napr. ťuk na pin) sa vždy zobrazí, aj keď je ďalej v zozname.
 */
export function PlaceList({ places, savedHas, onToggleSave, activeId = null, cardRef }: Props) {
  const [limit, setLimit] = useState(PAGE);
  const [prevPlaces, setPrevPlaces] = useState(places);
  if (prevPlaces !== places) {
    setPrevPlaces(places);
    setLimit(PAGE);
  }
  const activeIndex = activeId ? places.findIndex((p) => p.id === activeId) : -1;
  const shown = Math.max(limit, activeIndex + 1);
  const rest = places.length - shown;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {places.slice(0, shown).map((p) => (
          <PlaceCard
            key={p.id}
            ref={cardRef ? (el) => cardRef(p.id, el) : undefined}
            place={p}
            saved={savedHas(p.id)}
            active={activeId === p.id}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
      {rest > 0 && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setLimit(shown + PAGE)}
            className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-[15px] font-semibold text-ink shadow-card ring-1 ring-line transition hover:ring-ink-subtle active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Zobraziť ďalšie
          </button>
          <p className="text-[13px] text-ink-muted" aria-live="polite">
            Zobrazených {shown} z {placesLabel(places.length)}
          </p>
        </div>
      )}
    </>
  );
}
