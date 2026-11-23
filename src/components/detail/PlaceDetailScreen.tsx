"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, PLACES, type Place } from "@/data/places";
import { CITY_REGISTER } from "@/data/sources";
import { useOrigin } from "@/lib/preferences";
import type { PlaceDetail } from "@/data/placeDetails";
import { distanceKm, formatAge, formatDate, formatDistance, formatPrice, formatScore, reviewsLabel, scoreLabel } from "@/lib/search";
import { useSaved } from "@/lib/saved";
import { Toast, useToast } from "@/components/ui/Toast";
import { MapPreview } from "@/components/home/MapPreview";
import { PlaceArt } from "@/components/home/PlaceArt";
import { CheckBadgeIcon, ClockIcon, HeartIcon, PinIcon, StarIcon } from "@/components/home/icons";
import { NavigationSheet } from "./NavigationSheet";
import { ReportDialog } from "./ReportDialog";
import { useMyReviews } from "@/lib/community";

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

function NavigateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.6 3.4a1 1 0 0 0-1.1-.2L3.7 9.8a1 1 0 0 0 .1 1.9l6.7 1.8 1.8 6.7a1 1 0 0 0 1.9.1l6.6-15.8a1 1 0 0 0-.2-1.1Z" />
    </svg>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  const id = `sec-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="border-t border-line py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={id} className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Fact({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
      <dt className="text-[12.5px] font-medium text-ink-muted">{label}</dt>
      <dd className={`mt-0.5 text-[15px] font-semibold ${muted ? "font-medium text-ink-muted" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function CriteriaBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[14px]">
        <span className="text-ink">{label}</span>
        <span className="font-semibold text-ink">
          {formatScore(value)}
          <span className="sr-only"> z 10</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-100" aria-hidden="true">
        <div className="h-full rounded-full bg-turquoise-400" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

export function PlaceDetailScreen({ place, detail }: { place: Place; detail: PlaceDetail }) {
  const router = useRouter();
  const saved = useSaved();
  const isSaved = saved.has(place.id);
  const [navOpen, setNavOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [myReviews] = useMyReviews();
  const mine = myReviews.find((r) => r.placeId === place.id);
  const { message, show } = useToast();
  const category = CATEGORIES.find((c) => c.id === place.category)!;
  const origin = useOrigin();
  const km = distanceKm(origin, place);

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const toggleSave = () => {
    const now = saved.toggle(place.id);
    show(now ? "Uložené do obľúbených (iba v tomto prehliadači, DEMO)" : "Odstránené z obľúbených");
  };

  return (
    <>
      <div className="mx-auto max-w-3xl pb-36 sm:px-8 sm:pt-6">
        {/* Hero */}
        <div className="relative">
          <div className="aspect-[3/2] overflow-hidden sm:aspect-[16/9] sm:rounded-[28px]">
            <PlaceArt id={place.id} category={place.category} />
          </div>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),14px)]">
            <button
              type="button"
              onClick={goBack}
              aria-label="Späť"
              className="flex size-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <BackIcon />
            </button>
            <button
              type="button"
              onClick={toggleSave}
              aria-pressed={isSaved}
              aria-label={isSaved ? "Odstrániť z obľúbených" : "Uložiť do obľúbených"}
              className="flex size-11 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <HeartIcon size={21} filled={isSaved} className={isSaved ? "text-coral-500" : "text-ink"} />
            </button>
          </div>
          <span className="absolute bottom-9 left-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink backdrop-blur sm:bottom-4">
            {place.isDemo ? "DEMO · ilustračný obrázok" : "Ilustračný obrázok"}
          </span>
        </div>

        <main className="relative -mt-6 rounded-t-[28px] bg-cream-50 px-5 pt-6 sm:mt-0 sm:rounded-none sm:px-0">
          {/* Hlavička */}
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
            <span className="rounded-full bg-white px-2.5 py-1 text-ink ring-1 ring-line">{category.shortLabel}</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-ink ring-1 ring-line">{place.indoor ? "Vnútri" : "Vonku"}</span>
          </div>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-[1.12] tracking-[-0.03em] text-ink sm:text-[34px]">
            {place.name}
          </h1>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[15px] text-ink-muted">
            <PinIcon size={16} className="text-turquoise-700" />
            {place.area} · {formatDistance(km)} od centra {origin.of}
          </p>

          {/* Hodnotenie + overenie */}
          <div className="mt-5 flex items-center gap-4 rounded-[22px] bg-white p-4 shadow-card ring-1 ring-line">
            {place.score !== null ? (
              <>
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-amber-50">
                  <StarIcon size={14} className="text-amber-400" />
                  <span className="text-[19px] font-bold leading-none text-amber-700">{formatScore(place.score)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-ink">
                    {scoreLabel(place.score)} <span className="sr-only">, {formatScore(place.score)} z 10</span>
                  </p>
                  <a href="#sec-hodnotenie-rodičov" className="text-[14px] text-ink-muted underline-offset-2 hover:underline">
                    {reviewsLabel(place.reviewCount)} rodičov
                  </a>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[16px] font-semibold text-ink">Zatiaľ bez hodnotení</p>
                <p className="text-[14px] text-ink-muted">Buďte prvý, kto miesto ohodnotí.</p>
              </div>
            )}
          </div>
          <p
            className={`mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium ${
              place.verified ? "text-turquoise-700" : "text-ink-muted"
            }`}
          >
            {place.source === "osm" ? (
              <>
                <PinIcon size={16} /> Skutočné verejné ihrisko · údaje z OpenStreetMap, kurátor ich zatiaľ neoveril
              </>
            ) : place.source === "city" ? (
              <>
                <PinIcon size={16} /> Ihrisko z registra športovísk mesta · údaje zatiaľ neoverené, pred návštevou si ich overte
              </>
            ) : place.web ? (
              <>
                <CheckBadgeIcon size={17} /> Skutočné miesto · údaje sme overili na webe prevádzky {formatDate(place.web.checkedAt)}
              </>
            ) : place.verified ? (
              <>
                <CheckBadgeIcon size={17} /> Údaje overené kurátorom (simulované)
              </>
            ) : (
              <>
                <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-ink-subtle" /> Údaje zatiaľ neoverené, pred návštevou si ich overte
              </>
            )}
          </p>

          {/* Rýchle fakty */}
          <dl className="mt-5 grid grid-cols-2 gap-2.5">
            <Fact
              label="Vhodný vek"
              value={formatAge(place.ageMin, place.ageMax)}
              muted={place.ageMin === null && place.ageMax === null}
            />
            <Fact label="Cena" value={formatPrice(place.price)} muted={place.price.kind === "unknown"} />
            <Fact
              label="Dnes"
              value={place.hoursToday ?? (detail.hoursWeek ? "Pozrite hodiny nižšie" : "Hodiny neoverené")}
              muted={!place.hoursToday}
            />
            <Fact label="Prostredie" value={place.indoor ? "Vnútorný priestor" : "Vonkajší priestor"} />
            {place.surface && <Fact label="Povrch" value={place.surface} />}
          </dl>

          {place.web?.priceNote && (
            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">Cena: </span>
              {place.web.priceNote}
            </p>
          )}

          <div className="mt-6">
            <Section title="O mieste">
              <p className="text-[15.5px] leading-relaxed text-ink">{detail.description}</p>
            </Section>

            <Section title="Vybavenie">
              {place.amenities.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {place.amenities.map((a) => (
                    <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[14px] text-ink ring-1 ring-line">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-turquoise-400" />
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] text-ink-muted">Vybavenie zatiaľ nie je uvedené.</p>
              )}
            </Section>

            <Section
              title="Hodnotenie rodičov"
              aside={
                <Link
                  href={`/miesto/${place.id}/hodnotit`}
                  className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-[14px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {mine ? "Upraviť" : "Ohodnotiť"}
                </Link>
              }
            >
              {detail.criteria ? (
                <div className="space-y-3.5 rounded-[22px] bg-white p-4 ring-1 ring-line">
                  <CriteriaBar label="Čistota priestoru" value={detail.criteria.cleanliness} />
                  <CriteriaBar label="Kreativita priestoru" value={detail.criteria.creativity} />
                  <CriteriaBar label="Celkový dojem" value={detail.criteria.overall} />
                </div>
              ) : (
                <p className="text-[15px] text-ink-muted">Podrobné hodnotenie zatiaľ nie je k dispozícii.</p>
              )}

              {mine && (
                <div className="mt-4 rounded-[22px] bg-turquoise-50 p-4 ring-1 ring-turquoise-400/40">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-semibold text-turquoise-700">
                      Vaše hodnotenie (DEMO, iba v tomto prehliadači){mine.hidden ? " · recenziu skryl administrátor" : ""}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[13px] font-semibold text-amber-700">
                      <StarIcon size={12} className="text-amber-400" />
                      {mine.overall}
                      <span className="sr-only"> z 10</span>
                    </span>
                  </div>
                  {(mine.cleanliness || mine.creativity) && (
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {mine.cleanliness ? `Čistota ${mine.cleanliness}` : ""}
                      {mine.cleanliness && mine.creativity ? " · " : ""}
                      {mine.creativity ? `Kreativita ${mine.creativity}` : ""}
                    </p>
                  )}
                  {mine.text && <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{mine.text}</p>}
                  {mine.photo && (
                    <p className="mt-1.5 text-[13px] text-ink-muted">
                      Fotka: {mine.photo.status === "approved" ? "schválená" : mine.photo.status === "rejected" ? "zamietnutá" : "čaká na schválenie"}
                    </p>
                  )}
                </div>
              )}

              {detail.reviews.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {detail.reviews.map((r, i) => (
                    <li key={i} className="rounded-[22px] bg-white p-4 ring-1 ring-line">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[14px] font-semibold text-ink">{r.author}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[13px] font-semibold text-amber-700">
                          <StarIcon size={12} className="text-amber-400" />
                          {r.score}
                          <span className="sr-only"> z 10</span>
                        </span>
                      </div>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{r.text}</p>
                      <p className="mt-1.5 text-[12.5px] text-ink-muted">{r.when}</p>
                    </li>
                  ))}
                </ul>
              )}
              {place.isDemo && (
                <p className="mt-3 text-[12.5px] text-ink-muted">Hodnotenia aj recenzie sú vymyslené ukážky (DEMO).</p>
              )}
            </Section>

            <Section title="Otváracie hodiny">
              {detail.hoursWeek ? (
                <dl className="divide-y divide-line rounded-[22px] bg-white px-4 ring-1 ring-line">
                  {detail.hoursWeek.map((h) => (
                    <div key={h.days} className="flex justify-between py-3 text-[15px]">
                      <dt className="text-ink-muted">{h.days}</dt>
                      <dd className="font-medium text-ink">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {detail.hoursWeek && place.web && (
                <p className="mt-2 text-[13px] text-ink-muted">
                  Podľa webu prevádzky k {formatDate(place.web.checkedAt)}. Cez sviatky sa hodiny môžu líšiť.
                </p>
              )}
              {detail.hoursWeek ? null : (
                <p className="flex items-start gap-2 text-[15px] leading-relaxed text-ink-muted">
                  <ClockIcon size={18} className="mt-0.5 shrink-0" />
                  {place.openingHours
                    ? `Podľa OpenStreetMap: ${place.openingHours}. Kurátor ich zatiaľ neoveril.`
                    : "Otváracie hodiny zatiaľ nemáme overené."}{" "}
                  {place.openingHours ? "" : place.indoor ? "Pred návštevou si ich overte u prevádzky." : "Verejné ihriská bývajú zvyčajne prístupné celý deň."}
                </p>
              )}
            </Section>

            <Section title="Poloha">
              <MapPreview places={[place]} activeId={place.id} onSelect={() => setNavOpen(true)} label="Poloha na mape" />
              <p className="mt-3 text-[15px] text-ink">
                {place.web
                  ? place.web.address
                  : place.area === "Bratislava a okolie"
                    ? place.area
                    : `${place.area}, Bratislava a okolie`}
              </p>
              {place.web ? (
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {place.web.approxPosition
                    ? "Bod na mape je len približný; navigácia vedie na adresu prevádzky."
                    : `GPS ${place.lat.toFixed(5)}, ${place.lng.toFixed(5)} · poloha © prispievatelia OpenStreetMap`}
                </p>
              ) : place.osm ? (
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  GPS {place.lat.toFixed(5)}, {place.lng.toFixed(5)} ·{" "}
                  <a
                    href={`https://www.openstreetmap.org/${place.osm.type}/${place.osm.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-turquoise-700 underline underline-offset-2"
                  >
                    zobraziť v OpenStreetMap
                  </a>
                </p>
              ) : (
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  Presná adresa zatiaľ neoverená · GPS {place.lat.toFixed(4)}, {place.lng.toFixed(4)} (ilustračné)
                </p>
              )}
            </Section>

            <Section title="Pôvod údajov">
              {place.source === "osm" ? (
                <p className="text-[14px] leading-relaxed text-ink-muted">
                  Poloha, názov a vybavenie pochádzajú z{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-turquoise-700 underline underline-offset-2"
                  >
                    © prispievatelia OpenStreetMap
                  </a>{" "}
                  (licencia ODbL). Údaje dopĺňajú dobrovoľníci, preto môžu byť neúplné; chýbajúci údaj neznamená, že na
                  ihrisku niečo chýba. Ak ihrisko v OpenStreetMap nemá vlastný názov, pomenovali sme ho podľa parku, najbližšej ulice, štvrte alebo mestskej časti.
                </p>
              ) : place.source === "city" ? (
                <p className="text-[14px] leading-relaxed text-ink-muted">
                  Poloha a názov pochádzajú z registra športovísk, zdroj: {CITY_REGISTER.attribution}
                  {CITY_REGISTER.license ? ` (licencia ${CITY_REGISTER.license})` : ""}. Ihrisko zatiaľ nie je v OpenStreetMap a
                  kurátor KUTISKO ho neoveril; chýbajúci údaj neznamená, že na ihrisku niečo chýba.
                </p>
              ) : place.web ? (
                <div className="text-[14px] leading-relaxed text-ink-muted">
                  <p>
                    Názov, adresu, hodiny, cenu, vek a vybavenie sme {formatDate(place.web.checkedAt)} overili na webe
                    prevádzky alebo obchodného centra. Popis je náš vlastný. Údaje, ktoré prevádzka neuvádza, necháme
                    prázdne. Hodnotenia rodičov zatiaľ nemáme.
                  </p>
                  <a
                    href={place.web.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-[14px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    Web prevádzky<span className="sr-only"> (otvorí sa v novom okne)</span>
                  </a>
                  <p className="mt-3 text-[12.5px]">
                    Zdroj:{" "}
                    {place.web.sources.map((u, i) => (
                      <span key={u}>
                        {i > 0 && ", "}
                        <a href={u} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
                          {new URL(u).hostname.replace(/^www\./, "")}
                          {new URL(u).pathname.length > 1 ? new URL(u).pathname.replace(/\/$/, "") : ""}
                        </a>
                      </span>
                    ))}
                  </p>
                </div>
              ) : (
                <p className="text-[14px] leading-relaxed text-ink-muted">
                  Zdroj: syntetické ukážkové dáta prototypu KUTISKO. Miesto, hodnotenia, ceny ani hodiny neexistujú.
                </p>
              )}
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="mt-3 min-h-10 text-[14px] font-semibold text-coral-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
              >
                Nahlásiť nesprávny údaj
              </button>
            </Section>

            <Section title="Ďalšie miesta v okolí">
              <ul className="space-y-2">
                {PLACES.filter((p) => p.id !== place.id)
                  .sort((a, b) => distanceKm(place, a) - distanceKm(place, b))
                  .slice(0, 3)
                  .map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/miesto/${p.id}`}
                        className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-4 ring-1 ring-line transition hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        <span className="size-14 shrink-0 overflow-hidden rounded-xl">
                          <PlaceArt id={p.id} category={p.category} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-ink">{p.name}</span>
                          <span className="block text-[13px] text-ink-muted">
                            {p.area} · {formatDistance(distanceKm(place, p))}
                          </span>
                        </span>
                        {p.score !== null && (
                          <span className="text-[14px] font-semibold text-amber-700">{formatScore(p.score)}</span>
                        )}
                      </Link>
                    </li>
                  ))}
              </ul>
            </Section>
          </div>
        </main>
      </div>

      {/* Spodná akčná lišta */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="min-w-0">
            <p className={`text-[16px] font-bold ${place.price.kind === "unknown" ? "text-ink-muted" : "text-ink"}`}>
              {formatPrice(place.price)}
            </p>
            <p className="truncate text-[13px] text-ink-muted">
              {place.hoursToday ? `Dnes ${place.hoursToday}` : "Hodiny neoverené"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-coral-600 px-6 text-[16px] font-semibold text-white shadow-[0_6px_16px_-6px_rgb(214_38_74/0.6)] transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <NavigateIcon />
            Navigovať
          </button>
        </div>
      </div>

      <Toast message={message} offset={88} />
      <NavigationSheet place={place} open={navOpen} onClose={() => setNavOpen(false)} />
      <ReportDialog
        placeId={place.id}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onDone={() => {
          setReportOpen(false);
          show("Ďakujeme, nahlásenie sme prijali (DEMO)");
        }}
      />
    </>
  );
}

export function PlaceDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl sm:px-8 sm:pt-6" aria-busy="true" aria-label="Načítavam detail miesta">
      <div className="skeleton aspect-[3/2] sm:aspect-[16/9] sm:rounded-[28px]" />
      <div className="relative -mt-6 space-y-3 rounded-t-[28px] bg-cream-50 px-5 pt-6 sm:mt-0 sm:px-0">
        <div className="skeleton h-6 w-32 rounded-full" />
        <div className="skeleton h-8 w-3/4 rounded-full" />
        <div className="skeleton h-4 w-1/2 rounded-full" />
        <div className="skeleton mt-4 h-20 rounded-[22px]" />
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
