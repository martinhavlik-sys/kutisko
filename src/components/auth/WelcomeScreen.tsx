"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AGE_BANDS } from "@/data/places";
import { useAccount } from "@/lib/account";
import { usePreferences } from "@/lib/preferences";
import { firstName } from "@/lib/validation";
import { primaryBtn } from "@/components/forms/FormParts";

/**
 * Krátke uvítanie „Ahoj [meno]“ po registrácii aj po každom prihlásení (PROTOTYPE_BRIEF bod 9, rozhodnutie Martina).
 * Nič neblokuje: jedno ťuknutie vedie do vyhľadávania, výber veku je nepovinný.
 */
export function WelcomeScreen() {
  const { account } = useAccount();
  const isNew = useSearchParams().get("novy") === "1";
  const { prefs, set } = usePreferences();
  const name = account ? firstName(account.name) : null;
  const searchHref = prefs.ageId ? `/hladat?vek=${encodeURIComponent(prefs.ageId)}` : "/";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-[max(env(safe-area-inset-top),16px)]">
      <header className="flex items-center justify-between py-2">
        <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-coral-600">kutisko</span>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-3 text-[15px] font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink">
          Preskočiť
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
          <div className="relative">
            <span aria-hidden="true" className="absolute inset-4 -z-10 rounded-full bg-amber-50" />
            <Image src="/illustrations/dieta-kocky.png" alt="" width={681} height={674} priority className="h-auto w-[120px] select-none min-[400px]:w-[148px]" />
          </div>
          <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-ink">
            {name ? (
              <>
                Ahoj, <span className="text-coral-600">{name}</span>!
              </>
            ) : (
              "Ahoj!"
            )}
          </h1>
          <p className="mt-3 max-w-xs text-[16px] leading-relaxed text-ink-muted">
            {account
              ? isNew
                ? "Účet je pripravený. Nájdeme kútik, herňu alebo ihrisko, kde sa deťom bude páčiť."
                : "Vitajte späť. Kam to bude dnes: kútik, herňa alebo ihrisko?"
              : "Nájdeme kútik, herňu alebo ihrisko, kde sa deťom bude páčiť."}
          </p>
          {account && <p className="mt-2 rounded-full bg-amber-50 px-3 py-1 text-[12.5px] font-semibold text-amber-700">DEMO účet · iba v tomto prehliadači</p>}
        </div>

        <div role="group" aria-labelledby="w-age" className="rounded-[26px] bg-white p-5 shadow-card ring-1 ring-line">
          <p id="w-age" className="text-[15px] font-semibold text-ink">
            Koľko rokov má vaše dieťa?
          </p>
          <p className="mt-0.5 text-[13.5px] text-ink-muted">Nepovinné. Zmeníte to kedykoľvek v Profile.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {AGE_BANDS.map((b) => {
              const active = prefs.ageId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set({ ageId: active ? null : b.id })}
                  className={`min-h-12 rounded-2xl text-[15px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    active ? "bg-ink text-white" : "bg-cream-50 text-ink ring-1 ring-line hover:ring-ink-subtle"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        <Link href={searchHref} className={`${primaryBtn} mt-5 w-full`}>
          Začať hľadať
        </Link>
        {!account && (
          <p className="mt-4 text-center text-[14.5px] text-ink-muted">
            <Link href="/registracia" className="inline-flex min-h-11 items-center font-semibold text-coral-600 underline-offset-2 hover:underline">
              Vytvoriť DEMO účet
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
