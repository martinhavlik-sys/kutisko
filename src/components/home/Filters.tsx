"use client";

import { AGE_BANDS, CATEGORIES, type CategoryId } from "@/data/places";
import {
  CategoryAllIcon,
  CategoryHernaIcon,
  CategoryIhriskoIcon,
  CategoryKutikIcon,
} from "./icons";

const CATEGORY_ICONS = {
  all: CategoryAllIcon,
  kutik: CategoryKutikIcon,
  herna: CategoryHernaIcon,
  ihrisko: CategoryIhriskoIcon,
} as const;

const CATEGORY_TABS: { id: CategoryId | null; label: string; icon: keyof typeof CATEGORY_ICONS }[] = [
  { id: null, label: "Všetko", icon: "all" },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.shortLabel === "Kútik" ? "Kútiky" : c.shortLabel === "Herňa" ? "Herne" : "Ihriská", icon: c.id })),
];

export function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryId | null;
  onChange: (v: CategoryId | null) => void;
}) {
  return (
    <div role="group" aria-label="Kategória" className="grid grid-cols-4 gap-1.5">
      {CATEGORY_TABS.map((tab) => {
        const Icon = CATEGORY_ICONS[tab.icon];
        const active = value === tab.id;
        return (
          <button
            key={tab.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-2xl text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              active
                ? "bg-white text-ink shadow-card ring-1 ring-line"
                : "text-ink-muted hover:bg-white/60 hover:text-ink"
            }`}
          >
            <Icon size={24} strokeWidth={active ? 2 : 1.7} className={active ? "text-coral-600" : undefined} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AgeChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div role="group" aria-labelledby="age-label" className="flex items-center gap-2">
      <span id="age-label" className="shrink-0 pl-1 text-[13px] font-medium text-ink-muted">
        Vek
      </span>
      <div className="no-scrollbar -mr-5 flex gap-2 overflow-x-auto pr-5 sm:mr-0 sm:pr-0">
        {AGE_BANDS.map((band) => {
          const active = value === band.id;
          return (
            <button
              key={band.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : band.id)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-[14px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active
                  ? "bg-ink text-white"
                  : "bg-white text-ink ring-1 ring-line hover:ring-ink-subtle"
              }`}
            >
              {band.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
