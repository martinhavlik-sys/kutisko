"use client";

import { AGE_BANDS } from "@/data/places";
import { CITIES, DISTANCES, usePreferences } from "@/lib/preferences";
import { disableLocation, requestLocation, useLocation } from "@/lib/location";
import { useSaved } from "@/lib/saved";
import { useMyReviews } from "@/lib/community";
import { logoutDemo, useAccount } from "@/lib/account";
import { initials } from "@/lib/validation";
import { primaryBtn, secondaryBtn } from "@/components/forms/FormParts";
import { BottomNav } from "@/components/ui/BottomNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast, useToast } from "@/components/ui/Toast";
import { ChevronDownIcon, HeartIcon, PinIcon, StarIcon, UserIcon } from "@/components/home/icons";
import Link from "next/link";
import { PromoToggle } from "@/components/promo/PromoParts";

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

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

export function ProfileScreen() {
  const { prefs, set, clear, isEmpty } = usePreferences();
  const loc = useLocation();
  const saved = useSaved();
  const [myReviews] = useMyReviews();
  const { message, show } = useToast();
  const { account } = useAccount();

  const rows: { label: string; hint?: string; icon: React.ReactNode; href?: string; onClick?: () => void }[] = [
    {
      label: "Obľúbené miesta",
      hint: saved.ids.length ? String(saved.ids.length) : undefined,
      icon: <HeartIcon size={20} />,
      href: "/ulozene",
    },
    {
      label: "Moje hodnotenia",
      hint: String(myReviews.length),
      icon: <StarIcon size={18} />,
      onClick: () =>
        show(
          myReviews.length
            ? "Vaše hodnotenia nájdete v detaile hodnotených miest (DEMO)"
            : "Zatiaľ ste nič nehodnotili. Ohodnotiť môžete v detaile miesta.",
        ),
    },
    { label: "Navrhnúť nové miesto", icon: <PinIcon size={20} />, href: "/navrhnut" },
    ...(account ? [{ label: "Zmena hesla", icon: <UserIcon size={20} />, onClick: () => show("V prototype sa heslo nemení (DEMO)") }] : []),
  ];

  return (
    <>
      <div className="mx-auto max-w-3xl px-5 pb-32 sm:px-8">
        <PageHeader title="Profil" />

        <main className="mt-4 space-y-8">
          {/* Účet (simulovaný) */}
          {account ? (
            <section aria-label="Účet" className="flex items-center gap-4 rounded-[26px] bg-white p-4 shadow-card ring-1 ring-line">
              <span
                aria-hidden="true"
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-coral-50 font-display text-[20px] font-bold text-coral-600"
              >
                {initials(account.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[17px] font-semibold text-ink">{account.name}</p>
                <p className="truncate text-[13.5px] text-ink-muted">{account.email}</p>
                <p className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11.5px] font-semibold text-amber-700">
                  DEMO účet · iba v tomto prehliadači
                </p>
              </div>
            </section>
          ) : (
            <section aria-labelledby="acc-title" className="rounded-[26px] bg-white p-5 shadow-card ring-1 ring-line">
              <h2 id="acc-title" className="text-[17px] font-semibold text-ink">
                Nie ste prihlásení
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                S účtom budete mať obľúbené miesta, hodnotenia a návrhy pod svojím menom. V prototype je účet len simulovaný (DEMO).
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Link href="/registracia" className={primaryBtn}>
                  Vytvoriť účet
                </Link>
                <Link href="/prihlasenie" className={secondaryBtn}>
                  Prihlásiť sa
                </Link>
              </div>
            </section>
          )}

          {/* Preferencie */}
          <section aria-labelledby="prefs-title">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="prefs-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
                  Preferencie
                </h2>
                <p className="mt-0.5 text-[14px] text-ink-muted">Nepovinné. Kedykoľvek ich zmeníte alebo vymažete.</p>
              </div>
            </div>

            <div className="mt-4 space-y-5 rounded-[26px] bg-white p-5 ring-1 ring-line">
              <fieldset>
                <legend className="mb-2.5 text-[15px] font-semibold text-ink">Vek dieťaťa</legend>
                <div className="flex flex-wrap gap-2">
                  {AGE_BANDS.map((b) => (
                    <Chip key={b.id} active={prefs.ageId === b.id} onClick={() => set({ ageId: prefs.ageId === b.id ? null : b.id })}>
                      {b.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="city" className="mb-2.5 block text-[15px] font-semibold text-ink">
                  Lokalita
                </label>
                <div className="relative">
                  <select
                    id="city"
                    value={prefs.city ?? ""}
                    onChange={(e) => set({ city: e.target.value || null })}
                    className="min-h-12 w-full appearance-none rounded-2xl bg-cream-50 px-4 pr-10 text-[16px] text-ink ring-1 ring-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    <option value="">Nevybraté (Bratislava a okolie)</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                </div>
                <p className="mt-1.5 text-[13px] text-ink-muted">Použije sa, keď polohu nezapnete alebo ju zamietnete.</p>
              </div>

              <div>
                <p className="mb-1 text-[15px] font-semibold text-ink">Moja poloha</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[14px] text-ink-muted" aria-live="polite">
                    {loc.status === "on"
                      ? "Zapnutá: vzdialenosti počítame od vás."
                      : loc.status === "locating"
                        ? "Zisťujem polohu…"
                        : loc.status === "denied"
                          ? "Zamietnutá v nastaveniach telefónu."
                          : loc.status === "outside"
                            ? "Ste mimo pilotnej oblasti."
                            : "Vypnutá."}
                  </p>
                  {loc.status === "on" ? (
                    <button type="button" onClick={disableLocation} className="min-h-10 rounded-full px-4 text-[14px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                      Nepoužívať polohu
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loc.status === "locating" || loc.status === "unavailable"}
                      onClick={() => void requestLocation()}
                      className="min-h-10 rounded-full bg-turquoise-700 px-4 text-[14px] font-semibold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      Použiť moju polohu
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[13px] text-ink-muted">Poloha ostáva len v tomto zariadení, neukladáme ju ani neposielame.</p>
              </div>

              <fieldset>
                <legend className="mb-2.5 text-[15px] font-semibold text-ink">Okruh vyhľadávania</legend>
                <div className="flex flex-wrap gap-2">
                  {DISTANCES.map((d) => (
                    <Chip
                      key={d}
                      active={prefs.maxDistanceKm === d}
                      onClick={() => set({ maxDistanceKm: prefs.maxDistanceKm === d ? null : d })}
                    >
                      do {d} km
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-[13px] text-ink-muted">Uložené iba v tomto prehliadači (DEMO).</p>
                <button
                  type="button"
                  disabled={isEmpty}
                  onClick={() => {
                    clear();
                    show("Preferencie vymazané");
                  }}
                  className="min-h-10 rounded-full px-4 text-[14px] font-semibold text-coral-600 ring-1 ring-line transition hover:ring-coral-600 disabled:cursor-not-allowed disabled:text-ink-subtle disabled:ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Vymazať preferencie
                </button>
              </div>
            </div>
          </section>

          {/* Ukážka nápadu na monetizáciu (docs/MONETIZACIA.md) */}
          <section aria-label="Ukážky nápadov" className="rounded-[26px] bg-white p-5 ring-1 ring-line">
            <PromoToggle onChange={(on) => show(on ? "Ukážka zapnutá, nájdete ju na Domove" : "Ukážka vypnutá")} />
            <Link
              href="/pre-prevadzky"
              className="mt-3 inline-flex min-h-11 items-center text-[14px] font-semibold text-coral-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
            >
              Ako by to videli prevádzky
            </Link>
          </section>

          {/* Ďalšie */}
          <section aria-label="Ďalšie možnosti">
            <ul className="divide-y divide-line overflow-hidden rounded-[26px] bg-white ring-1 ring-line">
              {rows.map((r) => {
                const inner = (
                  <>
                    <span className="flex size-9 items-center justify-center rounded-xl bg-cream-100 text-ink">{r.icon}</span>
                    <span className="flex-1 text-[15.5px] font-medium text-ink">{r.label}</span>
                    {r.hint && <span className="text-[14px] text-ink-muted">{r.hint}</span>}
                    <span className="text-ink-subtle">
                      <ChevronRight />
                    </span>
                  </>
                );
                const cls =
                  "flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-cream-50 focus-visible:bg-cream-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink";
                return (
                  <li key={r.label}>
                    {r.href ? (
                      <Link href={r.href} className={cls}>
                        {inner}
                      </Link>
                    ) : (
                      <button type="button" onClick={r.onClick} className={cls}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {account && (
            <button
              type="button"
              onClick={() => {
                logoutDemo();
                show("Ste odhlásení (DEMO). Obľúbené a preferencie ostali v tomto prehliadači.");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="min-h-12 w-full rounded-full bg-white text-[15px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Odhlásiť sa
            </button>
          )}
          <p className="text-center text-[12.5px] leading-relaxed text-ink-muted">
            Prototyp KUTISKO · miesta sú skutočné, účet a vaše zápisy sú len ukážka (DEMO) v tomto prehliadači.
          </p>
          <p className="-mt-2 text-center text-[12.5px]">
            <Link href="/admin" className="inline-flex min-h-11 items-center px-2 font-medium text-ink-muted underline underline-offset-2 hover:text-ink">
              Pre tím: admin fronta (náhľad)
            </Link>
          </p>
        </main>
      </div>
      <Toast message={message} />
      <BottomNav />
    </>
  );
}
