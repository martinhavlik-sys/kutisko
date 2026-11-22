"use client";

import { useEffect, useRef } from "react";
import { NAV_PROVIDERS, navigationUrl, navTargetOf, type NavProvider } from "@/lib/navigation";
import type { Place } from "@/data/places";
import { CloseIcon } from "@/components/home/icons";

const PROVIDER_STYLE: Record<NavProvider, { bg: string; fg: string; glyph: string }> = {
  apple: { bg: "#1F1A16", fg: "#FFFFFF", glyph: "A" },
  google: { bg: "#E7F6F9", fg: "#0E6B7D", glyph: "G" },
  waze: { bg: "#FFF3D6", fg: "#8A5A00", glyph: "W" },
};

interface Props {
  place: Place;
  open: boolean;
  onClose: () => void;
}

/**
 * Výber externej navigácie (manifest bod 14). Natívny <dialog> zabezpečí
 * modálne správanie, zachytenie fokusu a zatvorenie klávesom Esc.
 */
export function NavigationSheet({ place, open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

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
      aria-labelledby="nav-title"
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] sm:m-auto sm:max-w-md"
    >
      <div className="mx-auto w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-float sm:rounded-[28px]">
        <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-cream-200 sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="nav-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              Navigovať do miesta
            </h2>
            <p className="mt-0.5 text-[14px] text-ink-muted">{place.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavrieť"
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
          {NAV_PROVIDERS.map((p) => {
            const st = PROVIDER_STYLE[p.id];
            return (
              <li key={p.id}>
                <a
                  href={navigationUrl(p.id, navTargetOf(place))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex min-h-14 items-center gap-3 px-4 py-3 text-[16px] font-semibold text-ink transition hover:bg-cream-50 focus-visible:bg-cream-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center rounded-xl text-[15px] font-bold"
                    style={{ background: st.bg, color: st.fg }}
                  >
                    {st.glyph}
                  </span>
                  {p.label}
                  <span className="ml-auto text-[13px] font-normal text-ink-muted">otvorí sa v novom okne</span>
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
          Ak aplikáciu nemáte, otvorí sa jej webová verzia. Štart trasy určí mapová služba, KUTISKO vašu polohu nezisťuje.
        </p>
        {place.isDemo && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-700">
            DEMO: súradnice sú len ilustračné. Na tomto mieste prevádzka v skutočnosti nemusí byť.
          </p>
        )}
        {place.web?.approxPosition && (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">Navigácia vedie na adresu {place.web.address}.</p>
        )}
      </div>
    </dialog>
  );
}
