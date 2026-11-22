"use client";

import { AGE_BANDS } from "@/data/places";
import { CITIES, DISTANCES, usePreferences } from "@/lib/preferences";
import { useSaved } from "@/lib/saved";
import { useMyReviews } from "@/lib/community";
import { BottomNav } from "@/components/ui/BottomNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast, useToast } from "@/components/ui/Toast";
import { CheckBadgeIcon, ChevronDownIcon, HeartIcon, PinIcon, StarIcon, UserIcon } from "@/components/home/icons";
import Link from "next/link";

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
  const saved = useSaved();
  const [myReviews] = useMyReviews();
  const { message, show } = useToast();

  const rows: { label: string; hint?: string; icon: React.ReactNode; href?: string; onClick?: () => void }[] = [
    { label: "Obľúbené miesta", hint: saved.ids.length ? String(saved.ids.length) : undefined, icon: <HeartIcon size={20} />, href: "/ulozene" },
    {
      label: "Moje hodnotenia",
      hint: String(myReviews.length),
      icon: <StarIcon size={18} />,
      onClick: () =>
        show(myReviews.length ? "Vaše hodnotenia nájdete v detaile hodnotených miest (DEMO)" : "Zatiaľ ste nič nehodnotili. Ohodnotiť môžete v detaile miesta."),
    },
    { label: "Navrhnúť nové miesto", icon: <PinIcon size={20} />, href: "/navrhnut" },
    { label: "Admin fronta (náhľad)", hint: "DEMO", icon: <CheckBadgeIcon size={20} />, href: "/admin" },
    { label: "Zmena hesla", icon: <UserIcon size={20} />, onClick: () => show("V prototype sa heslo nemení (DEMO)") },
  ];

  return (
    <>
      <div className="mx-auto max-w-3xl px-5 pb-32 sm:px-8">
        <PageHeader title="Profil" />

        <main className="mt-4 space-y-8">
          {/* Účet */}
          <section aria-label="Účet" className="flex items-center gap-4 rounded-[26px] bg-white p-4 shadow-card ring-1 ring-line">
            <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-coral-50 font-display text-[20px] font-bold text-coral-600">
              DR
            </span>
            <div className="min-w-0">
              <p className="text-[17px] font-semibold text-ink">Demo rodič</p>
              <p className="text-[13.5px] text-ink-muted">Simulovaný účet · nič sa neukladá na server</p>
            </div>
          </section>

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
                    className="min-h-12 w-full appearance-none rounded-2xl bg-cream-50 px-4 pr-10 text-[15px] text-ink ring-1 ring-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
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
                <p className="mt-1.5 text-[13px] text-ink-muted">Polohu nezisťujeme, lokalitu si vyberáte sami.</p>
              </div>

              <fieldset>
                <legend className="mb-2.5 text-[15px] font-semibold text-ink">Maximálna vzdialenosť</legend>
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

          <button
            type="button"
            onClick={() => show("Odhlásenie je v prototype len simulované (DEMO)")}
            className="min-h-12 w-full rounded-full bg-white text-[15px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Odhlásiť sa
          </button>
          <p className="text-center text-[12.5px] leading-relaxed text-ink-muted">
            Prototyp KUTISKO · bez registrácie a bez servera. Všetky údaje sú ukážkové.
          </p>
        </main>
      </div>
      <Toast message={message} />
      <BottomNav />
    </>
  );
}
