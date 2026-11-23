"use client";

import Image from "next/image";
import { useState } from "react";
import { isSamsungInternet, promptInstall, useInstallState } from "@/lib/pwa";
import { primaryBtn } from "@/components/forms/FormParts";

/**
 * Karta „Kutisko na ploche“ v Profile. Na Androide (Chrome, Samsung Internet)
 * otvorí systémové okno Inštalovať; na iPhone ukáže krátky návod.
 * Keď už aplikácia beží z plochy alebo inštalácia nie je možná, karta sa neukáže.
 */
export function InstallCard({ onInstalled }: { onInstalled: () => void }) {
  const state = useInstallState();
  const [busy, setBusy] = useState(false);

  if (state !== "prompt" && state !== "ios" && state !== "android-manual") return null;

  const howTo =
    state === "ios"
      ? "V Safari ťuknite dole na Zdieľať a potom na „Pridať na plochu“."
      : isSamsungInternet()
        ? "Ťuknite na menu ☰ dole vpravo, potom na „Pridať stránku do“ a „Domovská obrazovka“."
        : "Ťuknite na menu ⋮ vpravo hore a potom na „Pridať na plochu“ alebo „Inštalovať aplikáciu“.";

  return (
    <section aria-labelledby="install-title" className="rounded-[26px] bg-white p-5 ring-1 ring-line">
      <div className="flex items-start gap-4">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={52}
          height={52}
          className="size-13 shrink-0 rounded-[14px] ring-1 ring-line"
        />
        <div className="min-w-0">
          <h2 id="install-title" className="text-[17px] font-semibold text-ink">
            Kutisko na ploche telefónu
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
            Otvárajte Kutisko jedným ťuknutím ako aplikáciu, na celú obrazovku a bez lišty prehliadača.
          </p>
        </div>
      </div>
      {state === "prompt" ? (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const ok = await promptInstall().catch(() => false);
            setBusy(false);
            if (ok) onInstalled();
          }}
          className={`${primaryBtn} mt-4 w-full`}
        >
          Nainštalovať aplikáciu
        </button>
      ) : (
        <p className="mt-4 rounded-2xl bg-cream-50 px-4 py-3 text-[14px] leading-relaxed text-ink">{howTo}</p>
      )}
    </section>
  );
}
