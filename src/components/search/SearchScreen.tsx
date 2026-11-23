"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AGE_BANDS, CATEGORIES, PLACES } from "@/data/places";
import { useOrigin, usePreferences } from "@/lib/preferences";
import { distanceKm, filterAndSort, formatDistance, formatPrice, formatScore, placesLabel, SORT_OPTIONS, type SortId } from "@/lib/search";
import { useUrlFilters, type UrlFilters } from "@/lib/useUrlFilters";
import { useSaved } from "@/lib/saved";
import { BottomNav } from "@/components/ui/BottomNav";
import { Toast, useToast } from "@/components/ui/Toast";
import { PlaceCardSkeleton } from "@/components/home/PlaceCard";
import { PlaceList } from "@/components/home/PlaceList";
import { PlaceArt } from "@/components/home/PlaceArt";
import { EmptyState } from "@/components/home/States";
import { ChevronDownIcon, CloseIcon, HeartIcon, MapIcon, SearchIcon, SlidersIcon, StarIcon } from "@/components/home/icons";
import { PlacesMap } from "@/components/map/PlacesMap";
import { FilterSheet } from "./FilterSheet";
import { CityPicker } from "@/components/ui/CityPicker";
import { LocateIcon, PinIcon } from "@/components/home/icons";
import { originFor } from "@/lib/origin";

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function SearchScreen() {
  const { state, filters, update, reset, advancedCount } = useUrlFilters();
  const saved = useSaved();
  const { prefs, set: setPrefs } = usePreferences();
  const maxKm = prefs.maxDistanceKm;
  const [placeOpen, setPlaceOpen] = useState(false);
  const prefAge = AGE_BANDS.find((b) => b.id === prefs.ageId) ?? null;
  const { message, show } = useToast();
  const [draftQuery, setDraftQuery] = useState(state.query);
  const [sheetKey, setSheetKey] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Text sa do URL zapíše s krátkym oneskorením, aby písanie bolo plynulé.
  useEffect(() => {
    if (draftQuery === state.query) return;
    const t = window.setTimeout(() => update({ query: draftQuery }), 250);
    return () => window.clearTimeout(t);
  }, [draftQuery, state.query, update]);

  const origin = useOrigin();
  const results = useMemo(() => filterAndSort(PLACES, { ...filters, maxKm }, origin), [filters, origin, maxKm]);
  const active = results.find((p) => p.id === activeId) ?? null;
  const hasAny = state.query.trim() !== "" || state.category !== null || state.ageId !== null || advancedCount > 0 || maxKm !== null;

  const toggleSave = (id: string) => {
    const now = saved.toggle(id);
    show(now ? "Uložené do obľúbených (iba v tomto prehliadači, DEMO)" : "Odstránené z obľúbených");
  };

  const clearAll = () => {
    setDraftQuery("");
    reset();
    if (maxKm !== null) setPrefs({ maxDistanceKm: null });
  };

  const quickChips: { key: string; label: string; active: boolean; onClick: () => void }[] = [
    ...CATEGORIES.map((c) => ({
      key: c.id,
      label: c.label,
      active: state.category === c.id,
      onClick: () => update({ category: state.category === c.id ? null : c.id }),
    })),
    {
      key: "indoor",
      label: "Vnútri",
      active: state.environment === "indoor",
      onClick: () => update({ environment: state.environment === "indoor" ? "all" : "indoor" }),
    },
    {
      key: "outdoor",
      label: "Vonku",
      active: state.environment === "outdoor",
      onClick: () => update({ environment: state.environment === "outdoor" ? "all" : "outdoor" }),
    },
    {
      key: "free",
      label: "Zadarmo",
      active: state.onlyFree,
      onClick: () => update({ onlyFree: !state.onlyFree }),
    },
  ];

  const isMap = state.view === "map";
  const filterBadge = advancedCount + (state.category ? 1 : 0) + (state.ageId ? 1 : 0) + (maxKm !== null ? 1 : 0);
  const placeChipActive = origin.kind === "gps" || maxKm !== null;
  const placeChipLabel = `${origin.kind === "gps" ? "Moja poloha" : origin.city}${maxKm !== null ? ` · do ${maxKm} km` : ""}`;

  return (
    <div className={isMap ? "flex h-dvh flex-col overflow-hidden" : ""}>
      {/* Hlavička s vyhľadávaním */}
      <header className={`z-30 border-b border-line/70 bg-cream-50/95 backdrop-blur-xl ${isMap ? "" : "sticky top-0"}`}>
        <div className="mx-auto max-w-3xl px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] sm:px-8">
          <h1 className="sr-only">Hľadať miesta</h1>
          <div className="flex items-center gap-2">
            <form
              role="search"
              className="relative flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                update({ query: draftQuery });
                (document.activeElement as HTMLElement | null)?.blur();
              }}
            >
              <label htmlFor="q" className="sr-only">
                Hľadať miesto, mestskú časť alebo vybavenie
              </label>
              <SearchIcon size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink" />
              <input
                id="q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Kam ideme?"
                className="h-12 w-full appearance-none rounded-full bg-white pl-11 pr-11 text-[16px] text-ink shadow-card ring-1 ring-line placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink [&::-webkit-search-cancel-button]:hidden"
              />
              {draftQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftQuery("");
                    update({ query: "" });
                  }}
                  aria-label="Vymazať hľadanie"
                  className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <CloseIcon size={17} />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={() => {
                setSheetKey((k) => k + 1);
                setSheetOpen(true);
              }}
              className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-card ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              aria-label={filterBadge ? `Filtre, aktívne: ${filterBadge}` : "Filtre"}
            >
              <SlidersIcon size={20} />
              {filterBadge > 0 && (
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
                  {filterBadge}
                </span>
              )}
            </button>
          </div>

          <div role="group" aria-label="Rýchle filtre" className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setPlaceOpen(true)}
              aria-haspopup="dialog"
              aria-label={`Poloha a okruh: ${placeChipLabel}. Zmeniť`}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                placeChipActive ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink-subtle"
              }`}
            >
              {origin.kind === "gps" ? <LocateIcon size={14} /> : <PinIcon size={15} />}
              {placeChipLabel}
              <ChevronDownIcon size={14} />
            </button>
            {quickChips.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={c.active}
                onClick={c.onClick}
                className={`min-h-9 shrink-0 rounded-full px-3.5 text-[13.5px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  c.active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink-subtle"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {prefAge && state.ageId === null && (
            <button
              type="button"
              onClick={() => update({ ageId: prefAge.id })}
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-turquoise-50 px-3.5 text-[13.5px] font-semibold text-turquoise-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              + Použiť vek z profilu: {prefAge.label}
            </button>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
            <p className="text-[14px] text-ink-muted" aria-live="polite">
              <span className="font-semibold text-ink">{placesLabel(results.length)}</span>
              {hasAny && (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={clearAll}
                    className="font-medium text-coral-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    Zrušiť filtre
                  </button>
                </>
              )}
            </p>
            <div className="ml-auto flex items-center gap-2">
              {!isMap && (
                <label className="relative inline-flex items-center">
                  <span className="sr-only">Zoradiť</span>
                  <select
                    value={state.sort}
                    onChange={(e) => update({ sort: e.target.value as SortId })}
                    className="min-h-9 appearance-none rounded-full bg-white py-1 pl-3 pr-8 text-[13.5px] font-semibold text-ink ring-1 ring-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon size={16} className="pointer-events-none absolute right-2.5 text-ink-muted" />
                </label>
              )}
              <div role="group" aria-label="Zobrazenie" className="flex rounded-full bg-cream-100 p-0.5">
                {(
                  [
                    ["list", "Zoznam", ListIcon],
                    ["map", "Mapa", MapIcon],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={state.view === id}
                    onClick={() => {
                      setActiveId(null);
                      update({ view: id as UrlFilters["view"] });
                    }}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-ink ${
                      state.view === id ? "bg-white text-ink shadow-card" : "text-ink-muted"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {isMap ? (
        <div className="relative flex-1 pb-[calc(58px+env(safe-area-inset-bottom))]">
          <PlacesMap places={results} activeId={activeId} onSelect={setActiveId} className="h-full w-full" me={origin.kind === "gps" ? origin : null} />
          <div className="pointer-events-none absolute inset-x-0 bottom-[calc(70px+env(safe-area-inset-bottom))] z-10 flex justify-center px-4">
            {active ? (
              <div className="pointer-events-auto relative flex w-full max-w-md items-center gap-3 rounded-[22px] bg-white p-2.5 pr-3 shadow-float ring-1 ring-line">
                <span className="size-[72px] shrink-0 overflow-hidden rounded-2xl">
                  <PlaceArt id={active.id} category={active.category} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/miesto/${active.id}`}
                    className="block truncate text-[16px] font-semibold text-ink after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ink"
                  >
                    {active.name}
                  </Link>
                  <p className="truncate text-[13px] text-ink-muted">
                    {active.area} · {formatDistance(distanceKm(origin, active))} {origin.from} · {formatPrice(active.price)}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-semibold text-amber-700">
                    {active.score !== null ? (
                      <>
                        <StarIcon size={13} className="text-amber-400" /> {formatScore(active.score)}
                        <span className="font-normal text-ink-muted">· DEMO</span>
                      </>
                    ) : (
                      <span className="font-medium text-turquoise-700">
                        {active.isDemo ? "Nové · DEMO" : "Zatiaľ bez hodnotení"}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSave(active.id)}
                  aria-pressed={saved.has(active.id)}
                  aria-label={saved.has(active.id) ? "Odstrániť z obľúbených" : "Uložiť do obľúbených"}
                  className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <HeartIcon size={20} filled={saved.has(active.id)} className={saved.has(active.id) ? "text-coral-500" : "text-ink"} />
                </button>
              </div>
            ) : (
              <p className="rounded-full bg-ink/85 px-4 py-2 text-[13px] font-medium text-white shadow-float backdrop-blur">
                {results.length > 0 ? `${placesLabel(results.length)} na mape · ťuknite na pin` : "Žiadne miesta pre tieto filtre"}
              </p>
            )}
          </div>
        </div>
      ) : (
        <main id="vysledky" className="mx-auto max-w-3xl px-4 pb-32 pt-4 sm:px-8">
          {results.length === 0 ? (
            <EmptyState query={state.query.trim()} onReset={clearAll} radiusKm={maxKm} />
          ) : (
            <PlaceList places={results} savedHas={saved.has} onToggleSave={toggleSave} />
          )}
        </main>
      )}

      <FilterSheet
        key={sheetKey}
        open={sheetOpen}
        value={state}
        onClose={() => setSheetOpen(false)}
        onApply={(d) => {
          setSheetOpen(false);
          update(d);
        }}
      />
      <CityPicker
        open={placeOpen}
        onClose={() => setPlaceOpen(false)}
        onPicked={(c) => show(`Vzdialenosti počítame od centra ${originFor(c).of}`)}
        onLocated={(status) => {
          if (status === "on") {
            update({ sort: "distance" });
            setPlaceOpen(false);
            show("Zoraďujeme od najbližšieho k vám");
          } else if (status === "outside") show(`Ste mimo pilotnej oblasti, počítame od centra ${origin.of}`);
        }}
      />
      <Toast message={message} />
      <BottomNav autoHide={!isMap} />
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-8" aria-busy="true" aria-label="Načítavam vyhľadávanie">
      <div className="skeleton h-12 rounded-full" />
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
      </div>
    </div>
  );
}
