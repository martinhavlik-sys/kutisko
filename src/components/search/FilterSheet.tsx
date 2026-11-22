"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AGE_BANDS, CATEGORIES, PLACES, REFERENCE_POINT } from "@/data/places";
import { amenityOptions, filterAndSort, placesLabel, type Environment } from "@/lib/search";
import type { UrlFilters } from "@/lib/useUrlFilters";
import { CloseIcon } from "@/components/home/icons";

type Draft = Pick<UrlFilters, "query" | "category" | "ageId" | "environment" | "amenities" | "onlyVerified" | "onlyFree">;

const AMENITIES = amenityOptions(PLACES, 10);

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-full px-4 text-[14px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink-subtle"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        <span className="block text-[13px] text-ink-muted">{hint}</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-cream-200 transition peer-checked:bg-turquoise-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink" />
        <span className="absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function FilterSheet({
  open,
  value,
  onApply,
  onClose,
}: {
  open: boolean;
  value: Draft;
  onApply: (d: Draft) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(value);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const count = useMemo(
    () =>
      filterAndSort(
        PLACES,
        {
          query: draft.query,
          category: draft.category,
          ageBand: AGE_BANDS.find((b) => b.id === draft.ageId) ?? null,
          sort: "recommended",
          environment: draft.environment,
          amenities: draft.amenities,
          onlyVerified: draft.onlyVerified,
          onlyFree: draft.onlyFree,
        },
        REFERENCE_POINT,
      ).length,
    [draft],
  );

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="filter-title"
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] sm:m-auto sm:max-w-lg"
    >
      <div className="mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-cream-50 shadow-float sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavrieť filtre"
            className="-ml-2 flex size-11 items-center justify-center rounded-full text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <CloseIcon size={20} />
          </button>
          <h2 id="filter-title" className="font-display text-[17px] font-bold text-ink">
            Filtre
          </h2>
          <span className="w-9" aria-hidden="true" />
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <fieldset>
            <legend className="mb-2.5 text-[15px] font-semibold text-ink">Kategória</legend>
            <div className="flex flex-wrap gap-2">
              <Chip active={draft.category === null} onClick={() => set({ category: null })}>
                Všetko
              </Chip>
              {CATEGORIES.map((c) => (
                <Chip key={c.id} active={draft.category === c.id} onClick={() => set({ category: c.id })}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-[15px] font-semibold text-ink">Vek dieťaťa</legend>
            <div className="flex flex-wrap gap-2">
              {AGE_BANDS.map((b) => (
                <Chip key={b.id} active={draft.ageId === b.id} onClick={() => set({ ageId: draft.ageId === b.id ? null : b.id })}>
                  {b.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-[15px] font-semibold text-ink">Prostredie</legend>
            <div className="grid grid-cols-3 gap-1 rounded-full bg-cream-100 p-1">
              {(
                [
                  ["all", "Všetko"],
                  ["indoor", "Vnútri"],
                  ["outdoor", "Vonku"],
                ] as [Environment, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={draft.environment === id}
                  onClick={() => set({ environment: id })}
                  className={`min-h-10 rounded-full text-[14px] font-semibold transition focus-visible:outline-2 focus-visible:outline-ink ${
                    draft.environment === id ? "bg-white text-ink shadow-card" : "text-ink-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-[15px] font-semibold text-ink">Vybavenie</legend>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const on = draft.amenities.includes(a);
                return (
                  <Chip
                    key={a}
                    active={on}
                    onClick={() => set({ amenities: on ? draft.amenities.filter((x) => x !== a) : [...draft.amenities, a] })}
                  >
                    {a}
                  </Chip>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="divide-y divide-line rounded-[22px] bg-white px-4 ring-1 ring-line">
            <legend className="sr-only">Ďalšie</legend>
            <Toggle
              checked={draft.onlyVerified}
              onChange={(v) => set({ onlyVerified: v })}
              label="Iba overené údaje"
              hint="Údaje skontroloval kurátor (simulované)"
            />
            <Toggle checked={draft.onlyFree} onChange={(v) => set({ onlyFree: v })} label="Iba zadarmo" hint="Miesta bez vstupného" />
          </fieldset>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-white px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 sm:rounded-b-[28px]">
          <button
            type="button"
            onClick={() =>
              set({ category: null, ageId: null, environment: "all", amenities: [], onlyVerified: false, onlyFree: false })
            }
            className="min-h-11 px-1 text-[15px] font-semibold text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          >
            Vymazať všetko
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="min-h-12 rounded-full bg-coral-600 px-6 text-[16px] font-semibold text-white transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {count === 0 ? "Žiadne výsledky" : `Zobraziť ${placesLabel(count)}`}
          </button>
        </div>
      </div>
    </dialog>
  );
}
