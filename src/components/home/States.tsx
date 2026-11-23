import Image from "next/image";
import { AlertIcon, RefreshIcon } from "./icons";

export function EmptyState({ query, onReset, radiusKm = null }: { query: string; onReset: () => void; radiusKm?: number | null }) {
  return (
    <div className="flex flex-col items-center rounded-[26px] bg-white px-6 py-10 text-center shadow-card ring-1 ring-line">
      <Image src="/illustrations/dieta-lopta.png" alt="" width={681} height={674} className="mb-2 h-auto w-[132px] select-none" />
      <h3 className="text-[18px] font-semibold text-ink">Nič sme nenašli</h3>
      <p className="mt-1.5 max-w-xs text-[15px] leading-relaxed text-ink-muted">
        {query ? (
          <>
            Pre „<span className="font-medium text-ink">{query}</span>“ s aktuálnymi filtrami nemáme žiadne miesto.
          </>
        ) : (
          "S týmito filtrami nemáme žiadne miesto."
        )}{" "}
        {radiusKm !== null ? `V okruhu ${radiusKm} km nič nie je, skúste väčší okruh alebo zrušte filtre.` : "Skúste iný výraz alebo zrušte filtre."}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 min-h-11 rounded-full bg-coral-600 px-6 text-[15px] font-semibold text-white transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Zrušiť filtre
      </button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-[26px] bg-white px-6 py-10 text-center shadow-card ring-1 ring-line">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-coral-50 text-coral-600">
        <AlertIcon size={28} />
      </div>
      <h3 className="text-[18px] font-semibold text-ink">Miesta sa nepodarilo načítať</h3>
      <p className="mt-1.5 max-w-xs text-[15px] leading-relaxed text-ink-muted">
        Skontrolujte pripojenie a skúste to znova. Vaše filtre zostanú zachované.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-white transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-600"
      >
        <RefreshIcon size={18} />
        Skúsiť znova
      </button>
    </div>
  );
}
