"use client";

import { useEffect, useRef, useState } from "react";
import { addReport } from "@/lib/community";
import { CloseIcon } from "@/components/home/icons";
import { FieldError, primaryBtn } from "@/components/forms/FormParts";

const REASONS = ["Nesprávne otváracie hodiny", "Nesprávna cena", "Miesto je zatvorené alebo neexistuje", "Nesprávna poloha", "Iné"];

export function ReportDialog({ placeId, open, onClose, onDone }: { placeId: string; open: boolean; onClose: () => void; onDone: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();

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
      aria-labelledby="report-title"
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 sm:m-auto sm:max-w-md"
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason) {
            setError("Vyberte, čo nie je správne.");
            return;
          }
          if (reason === "Iné" && !note.trim()) {
            setError("Pri možnosti „Iné“ napíšte, čo treba opraviť.");
            return;
          }
          addReport({ placeId, reason, note: note.trim() });
          setReason(null);
          setNote("");
          setError(undefined);
          onDone();
        }}
        className="mx-auto w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-float sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="report-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
            Nahlásiť nesprávny údaj
          </h2>
          <button type="button" onClick={onClose} aria-label="Zavrieť" className="-mr-2 flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-cream-100">
            <CloseIcon size={20} />
          </button>
        </div>
        <fieldset className="mt-3" aria-describedby={error ? "report-err" : undefined}>
          <legend className="sr-only">Čo nie je správne</legend>
          <div className="divide-y divide-line rounded-2xl ring-1 ring-line">
            {REASONS.map((r) => (
              <label key={r} className="flex min-h-12 cursor-pointer items-center gap-3 px-4 text-[15px] text-ink">
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="size-5 accent-[var(--color-ink)]" />
                {r}
              </label>
            ))}
          </div>
        </fieldset>
        <label htmlFor="report-note" className="mt-4 block text-[14px] font-semibold text-ink">
          Poznámka <span className="font-normal text-ink-muted">{reason === "Iné" ? "povinné" : "nepovinné"}</span>
        </label>
        <textarea
          id="report-note"
          rows={3}
          maxLength={400}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1.5 w-full rounded-2xl bg-cream-50 px-4 py-3 text-[16px] text-ink ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-ink"
        />
        <FieldError id="report-err" message={error} />
        <p className="mt-3 text-[13px] text-amber-700">DEMO: nahlásenie sa uloží iba v tomto prehliadači a objaví sa v náhľade admin fronty.</p>
        <button type="submit" className={`${primaryBtn} mt-4 w-full`}>
          Odoslať nahlásenie
        </button>
      </form>
    </dialog>
  );
}
