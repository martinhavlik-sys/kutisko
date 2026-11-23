"use client";

import { useEffect, useRef } from "react";
import { useBackButtonClose } from "@/lib/pwa";
import { CITY_ORIGINS, RADIUS_OPTIONS, radiusLabel } from "@/lib/origin";
import { usePreferences } from "@/lib/preferences";
import { disableLocation, requestLocation, useLocation, type LocationStatus } from "@/lib/location";
import { CheckIcon, CloseIcon, LocateIcon } from "@/components/home/icons";

/**
 * „Kde hľadáte?“ — poloha, ručný výber mesta a okruh v km na jednom mieste.
 * Poloha sa zisťuje až po ťuknutí na „Použiť moju polohu“ (najprv vysvetlenie, potom systémová otázka).
 * Pri zamietnutí ostáva ručný výber mesta (manifest: „Pri zamietnutej geolokácii ponúknuť manuálny výber mesta“).
 */
export function CityPicker({
  open,
  onClose,
  onPicked,
  onLocated,
}: {
  open: boolean;
  onClose: () => void;
  onPicked?: (city: string) => void;
  /** Po pokuse o zistenie polohy (napr. prepnúť zoradenie na „Najbližšie“). */
  onLocated?: (status: LocationStatus) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useBackButtonClose(open, onClose);
  const { prefs, set } = usePreferences();
  const loc = useLocation();
  const gpsOn = loc.status === "on";
  const current = gpsOn ? null : (prefs.city ?? "Bratislava");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const locate = async () => {
    const status = await requestLocation();
    onLocated?.(status);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="city-title"
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 sm:m-auto sm:max-w-md"
    >
      <div className="mx-auto flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-[28px] bg-white shadow-float sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <h2 id="city-title" className="pt-2 font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
            Kde hľadáte?
          </h2>
          <button type="button" onClick={onClose} aria-label="Zavrieť" className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-4 pt-3">
          {/* Poloha */}
          <section aria-labelledby="loc-title" className="rounded-[22px] bg-turquoise-50 p-4 ring-1 ring-turquoise-400/30">
            <h3 id="loc-title" className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <LocateIcon size={18} className="text-turquoise-700" />
              Moja poloha
            </h3>
            <LocationBody status={loc.status} accuracy={loc.coords?.accuracy ?? null} onLocate={locate} />
          </section>

          {/* Mesto */}
          <section aria-labelledby="cities-title">
            <h3 id="cities-title" className="text-[15px] font-semibold text-ink">
              {gpsOn ? "Alebo hľadať od mesta" : "Hľadať od mesta"}
            </h3>
            <ul className="mt-2.5 divide-y divide-line rounded-2xl ring-1 ring-line">
              {CITY_ORIGINS.map((o) => {
                const active = o.city === current;
                return (
                  <li key={o.city}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        // Výber mesta má prednosť pred polohou — rodič chce hľadať inde.
                        if (gpsOn || loc.status === "locating") disableLocation();
                        set({ city: o.city === "Bratislava" ? null : o.city });
                        onPicked?.(o.city);
                      }}
                      className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-[15.5px] text-ink first:rounded-t-2xl last:rounded-b-2xl hover:bg-cream-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
                    >
                      <span className={active ? "font-semibold" : undefined}>
                        {o.city}
                        {o.city === "Bratislava" && <span className="ml-1.5 text-[13px] font-normal text-ink-muted">centrum, predvolené</span>}
                      </span>
                      {active && <CheckIcon size={18} className="text-coral-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Okruh */}
          <fieldset>
            <legend className="text-[15px] font-semibold text-ink">Okruh</legend>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Vzdušnou čiarou {gpsOn ? "od vás" : `od ${current === "Bratislava" ? "centra Bratislavy" : `centra ${CITY_ORIGINS.find((o) => o.city === current)?.of ?? ""}`}`}.
            </p>
            <RadiusChips value={prefs.maxDistanceKm} onChange={(km) => set({ maxDistanceKm: km })} className="mt-2.5" />
          </fieldset>
        </div>

        <div className="border-t border-line px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 w-full rounded-full bg-ink text-[16px] font-semibold text-white transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Hotovo
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function RadiusChips({
  value,
  onChange,
  className,
}: {
  value: number | null;
  onChange: (km: number | null) => void;
  className?: string;
}) {
  const options: (number | null)[] = [null, ...RADIUS_OPTIONS];
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {options.map((km) => {
        const active = value === km;
        return (
          <button
            key={km ?? "all"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(km)}
            className={`min-h-10 rounded-full px-4 text-[14px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink-subtle"
            }`}
          >
            {km === null ? radiusLabel(null) : `${km} km`}
          </button>
        );
      })}
    </div>
  );
}

const PRIVACY = "Polohu použijeme len na výpočet vzdialenosti priamo v tomto telefóne. Nikam ju neposielame ani neukladáme.";

function LocationBody({
  status,
  accuracy,
  onLocate,
}: {
  status: LocationStatus;
  accuracy: number | null;
  onLocate: () => void;
}) {
  const primary =
    "mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-turquoise-700 px-5 text-[15.5px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
  const secondary =
    "min-h-11 rounded-full bg-white px-4 text-[14px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

  if (status === "on") {
    return (
      <div aria-live="polite">
        <p className="mt-1.5 flex items-center gap-1.5 text-[14px] text-ink">
          <CheckIcon size={16} className="text-turquoise-700" />
          Vzdialenosti počítame od vás{accuracy !== null && accuracy > 0 ? ` (presnosť asi ${formatAccuracy(accuracy)})` : ""}.
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{PRIVACY}</p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onLocate} className={secondary}>
            Obnoviť polohu
          </button>
          <button type="button" onClick={disableLocation} className={secondary}>
            Nepoužívať polohu
          </button>
        </div>
      </div>
    );
  }

  const messages: Partial<Record<LocationStatus, React.ReactNode>> = {
    denied: (
      <>
        Prístup k polohe je vypnutý, preto počítame od mesta nižšie. Zapnete ho na iPhone v <strong className="font-semibold text-ink">Nastavenia → Súkromie a bezpečnosť → Polohové služby → Webové stránky Safari → Pri používaní</strong>, potom ťuknite znova.
      </>
    ),
    unavailable: "Tento prehliadač polohu neposkytuje. Vyberte mesto nižšie.",
    error: "Polohu sa nepodarilo zistiť (slabý signál alebo vypnuté Polohové služby). Skúste to znova alebo vyberte mesto.",
    outside: "Ste mimo Bratislavy a okolia. Pilot zatiaľ pokrýva len tento región, preto počítame od mesta nižšie.",
  };
  const msg = messages[status];

  return (
    <div aria-live="polite">
      {msg ? (
        <p role="status" className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
          {msg}
        </p>
      ) : (
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
          Ukážeme miesta okolo vás a zoradíme ich od najbližšieho. {PRIVACY}
        </p>
      )}
      {status !== "unavailable" && (
        <button type="button" onClick={onLocate} disabled={status === "locating"} className={primary}>
          {status === "locating" ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Zisťujem polohu…
            </>
          ) : (
            <>
              <LocateIcon size={18} />
              {status === "off" ? "Použiť moju polohu" : "Skúsiť znova"}
            </>
          )}
        </button>
      )}
    </div>
  );
}

function formatAccuracy(m: number): string {
  if (m < 1000) return `${Math.max(10, Math.round(m / 10) * 10)} m`;
  return `${(m / 1000).toFixed(1).replace(".", ",")} km`;
}
