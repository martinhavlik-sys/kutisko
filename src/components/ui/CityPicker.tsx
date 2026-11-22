"use client";

import { useEffect, useRef } from "react";
import { CITY_ORIGINS } from "@/lib/origin";
import { usePreferences } from "@/lib/preferences";
import { CheckIcon, CloseIcon } from "@/components/home/icons";

/**
 * Ručný výber mesta (manifest: „Pri zamietnutej geolokácii ponúknuť manuálny výber mesta“, scenár S5).
 * Prototyp polohu nezisťuje vôbec; výber sa uloží do preferencií (iba v prehliadači).
 */
export function CityPicker({ open, onClose, onPicked }: { open: boolean; onClose: () => void; onPicked?: (city: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { prefs, set } = usePreferences();
  const current = prefs.city ?? "Bratislava";

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="city-title"
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 sm:m-auto sm:max-w-md"
    >
      <div className="mx-auto w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-float sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="city-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              Kde hľadáte?
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
              Polohu nezisťujeme. Vyberte mesto, od ktorého počítame vzdialenosť a zoradenie „Najbližšie“.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zavrieť" className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink">
            <CloseIcon size={20} />
          </button>
        </div>
        <ul className="mt-4 divide-y divide-line rounded-2xl ring-1 ring-line">
          {CITY_ORIGINS.map((o) => {
            const active = o.city === current;
            return (
              <li key={o.city}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    set({ city: o.city === "Bratislava" ? null : o.city });
                    onPicked?.(o.city);
                    onClose();
                  }}
                  className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-[15.5px] text-ink first:rounded-t-2xl last:rounded-b-2xl hover:bg-cream-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
                >
                  <span className={active ? "font-semibold" : undefined}>
                    {o.city}
                    {o.city === "Bratislava" && <span className="ml-1.5 text-[13px] font-normal text-ink-muted">predvolené</span>}
                  </span>
                  {active && <CheckIcon size={18} className="text-coral-600" />}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[12.5px] text-ink-muted">Pilot: Bratislava a okolie. Zmeniť to môžete aj v Profile.</p>
      </div>
    </dialog>
  );
}
