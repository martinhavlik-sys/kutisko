"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AGE_BANDS, PLACES, type CategoryId } from "@/data/places";
import { useOrigin, usePreferences } from "@/lib/preferences";
import { originFor, radiusLabel } from "@/lib/origin";
import { useLocation } from "@/lib/location";
import { CityPicker } from "@/components/ui/CityPicker";
import { filterAndSort, placesLabel, SORT_OPTIONS, type SortId } from "@/lib/search";
import { useSaved } from "@/lib/saved";
import { useAccount } from "@/lib/account";
import { firstName, initials } from "@/lib/validation";
import { Toast, useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { AgeChips, CategoryTabs } from "./Filters";
import { ChevronDownIcon, CloseIcon, LocateIcon, PinIcon, SearchIcon, UserIcon } from "./icons";
import { MapPreview } from "./MapPreview";
import { PlaceCardSkeleton } from "./PlaceCard";
import { PlaceList } from "./PlaceList";
import { EmptyState, ErrorState } from "./States";
import { PROMO_PLACES } from "@/data/promoDemo";
import { pickSponsored } from "@/lib/promo";
import { usePromoDemo } from "@/lib/promoDemo";
import { EventsRail, SponsoredCard } from "@/components/promo/PromoParts";

type LoadState = "loading" | "ready" | "error";

/** Simulované načítanie DEMO dát. `?stav=chyba` / `?stav=nacitanie` zobrazí príslušný stav na testovanie. */
function useDemoPlaces(forced: string | null) {
  const [state, setState] = useState<LoadState>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (forced === "nacitanie") return;
    const failFirst = forced === "chyba" && attempt === 0;
    const t = window.setTimeout(() => setState(failFirst ? "error" : "ready"), 650);
    return () => window.clearTimeout(t);
  }, [forced, attempt]);

  const retry = useCallback(() => {
    setState("loading");
    setAttempt((a) => a + 1);
  }, []);

  return { state, retry };
}

export function HomeScreen() {
  const params = useSearchParams();
  const { state, retry } = useDemoPlaces(params.get("stav"));

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [ageId, setAgeId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortId>("recommended");
  const saved = useSaved();
  const { account } = useAccount();
  const origin = useOrigin();
  const loc = useLocation();
  const { prefs, set: setPrefs } = usePreferences();
  const maxKm = prefs.maxDistanceKm;
  const [cityOpen, setCityOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { message: toast, show: showToast } = useToast();

  const searchRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const results = useMemo(() => {
    const band = AGE_BANDS.find((b) => b.id === ageId) ?? null;
    return filterAndSort(PLACES, { query, category, ageBand: band, sort, maxKm }, origin);
  }, [query, category, ageId, sort, origin, maxKm]);

  // UKÁŽKA monetizácie (docs/MONETIZACIA.md): najviac 1 sponzorované miesto, len ak zodpovedá filtrom.
  const promo = usePromoDemo();
  const sponsored = useMemo(
    () => (promo.on ? pickSponsored(PROMO_PLACES, { category, ageBand: AGE_BANDS.find((b) => b.id === ageId) ?? null, query }) : []),
    [promo.on, category, ageId, query],
  );
  const hidePromo = () => {
    promo.setOn(false);
    showToast("Ukážka je skrytá. Zapnete ju v Profile.");
  };

  const hasFilters = query.trim() !== "" || category !== null || ageId !== null || maxKm !== null;

  const resetFilters = () => {
    setQuery("");
    setCategory(null);
    setAgeId(null);
    if (maxKm !== null) setPrefs({ maxDistanceKm: null });
  };

  const placeLabel =
    loc.status === "locating" && origin.kind !== "gps"
      ? "Zisťujem polohu…"
      : origin.kind === "gps"
        ? "Moja poloha"
        : origin.city === "Bratislava"
          ? "Bratislava a okolie"
          : origin.city;

  const toggleSave = (id: string) => {
    const nowSaved = saved.toggle(id);
    showToast(nowSaved ? "Uložené do obľúbených (iba v tomto prehliadači, DEMO)" : "Odstránené z obľúbených");
  };

  const selectFromMap = (id: string) => {
    setActiveId(id);
    const el = cardRefs.current.get(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const router = useRouter();
  const openFullMap = () => {
    const sp = new URLSearchParams({ zobrazenie: "mapa" });
    if (query.trim()) sp.set("q", query);
    if (category) sp.set("kat", category);
    if (ageId) sp.set("vek", ageId);
    if (sort !== "recommended") sp.set("zoradit", sort);
    router.push(`/hladat?${sp.toString()}`);
  };

  return (
    <>
      <a
        href="#vysledky"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Preskočiť na výsledky
      </a>

      <div className="mx-auto max-w-3xl px-5 pb-32 pt-[max(env(safe-area-inset-top),14px)] sm:px-8">
        {/* Hlavička */}
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            {/* Dočasný wordmark — logo nie je finálne (manifest, bod 23). */}
            <span className="font-display text-[22px] font-bold tracking-[-0.03em] text-coral-600">kutisko</span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-700">
              DEMO
            </span>
          </div>
          {account ? (
            <Link
              href="/profil"
              aria-label={`Profil: ${account.name}`}
              className="flex size-11 items-center justify-center rounded-full bg-coral-50 font-display text-[15px] font-bold text-coral-600 shadow-card ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {initials(account.name)}
            </Link>
          ) : (
            <Link
              href="/prihlasenie"
              className="flex min-h-11 items-center gap-1.5 rounded-full bg-white pl-3 pr-4 text-[14px] font-semibold text-ink shadow-card ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <UserIcon size={18} />
              Prihlásiť sa
            </Link>
          )}
        </header>

        <main>
          <section aria-labelledby="hero-title" className="relative pt-2">
            {/* Simonkina ilustrácia — striedmy prvok identity (manifest, bod 21). */}
            <Image
              src="/illustrations/dieta-kocky.png"
              alt=""
              width={681}
              height={674}
              priority
              className="pointer-events-none absolute -top-1 right-0 h-auto w-[78px] select-none sm:w-[112px]"
            />
            <p className="text-[15px] font-medium text-ink-muted">{account ? `Ahoj, ${firstName(account.name)}!` : "Ahoj!"}</p>
            <h1 id="hero-title" className="mt-0.5 pr-20 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-ink min-[400px]:text-[30px] sm:pr-28 sm:text-[40px]">
              Kam ideme dnes?
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCityOpen(true)}
              aria-haspopup="dialog"
              aria-label={`Lokalita: ${placeLabel}${maxKm !== null ? `, ${radiusLabel(maxKm)}` : ""}. Zmeniť`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-coral-50 pl-3 pr-2 text-[14px] text-ink-muted ring-1 ring-coral-600/15 transition hover:ring-coral-600/35 hover:text-ink active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {origin.kind === "gps" ? (
                <LocateIcon size={15} className="text-[#2563eb]" />
              ) : (
                <PinIcon size={16} className="text-coral-600" />
              )}
              <span className="font-semibold text-ink">{placeLabel}</span>
              {maxKm !== null && <span className="text-ink-muted">· {radiusLabel(maxKm)}</span>}
              <ChevronDownIcon size={16} />
            </button>
            {origin.kind !== "gps" && loc.status !== "locating" && (
              <button
                type="button"
                onClick={() => setCityOpen(true)}
                aria-haspopup="dialog"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-turquoise-50 px-3 text-[14px] font-semibold text-turquoise-700 ring-1 ring-turquoise-700/20 transition hover:ring-turquoise-700/45 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <LocateIcon size={15} />
                <span>
                  Použiť <span className="max-[359px]:hidden">moju </span>polohu
                </span>
              </button>
            )}
            </div>

            <form
              role="search"
              className="relative mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                searchRef.current?.blur();
                document.getElementById("vysledky")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <label htmlFor="search" className="sr-only">
                Hľadať miesto, mestskú časť alebo vybavenie
              </label>
              <SearchIcon size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
              <input
                ref={searchRef}
                id="search"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kútik, herňa, ihrisko, štvrť…"
                className="h-14 w-full appearance-none rounded-full bg-white pl-13 pr-14 text-[16px] text-ink shadow-float ring-1 ring-line placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Vymazať hľadanie"
                  className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <CloseIcon size={18} />
                </button>
              )}
            </form>
          </section>

          <section aria-label="Filtre" className="mt-5 space-y-3">
            <CategoryTabs value={category} onChange={setCategory} />
            <AgeChips value={ageId} onChange={setAgeId} />
          </section>

          <div className="mt-6">
            <MapPreview
              places={state === "ready" ? results : []}
              activeId={activeId}
              onSelect={selectFromMap}
              onOpenMap={openFullMap}
              loading={state === "loading"}
              me={origin.kind === "gps" ? origin : null}
            />
          </div>

          {state === "ready" && <EventsRail category={category} onHide={hidePromo} />}

          <section id="vysledky" aria-labelledby="results-title" className="mt-8 scroll-mt-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="results-title" className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink">
                  {hasFilters ? "Výsledky" : "Miesta v okolí"}
                </h2>
                <p className="mt-0.5 text-[14px] text-ink-muted" aria-live="polite">
                  {state === "ready" ? placesLabel(results.length) : state === "loading" ? "Načítavam…" : " "}
                  {state === "ready" && hasFilters && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="font-medium text-coral-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
                      >
                        Zrušiť filtre
                      </button>
                    </>
                  )}
                </p>
              </div>
              <label className="relative inline-flex shrink-0 items-center">
                <span className="sr-only">Zoradiť</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortId)}
                  className="min-h-11 appearance-none rounded-full bg-white py-2 pl-4 pr-10 text-[16px] font-semibold text-ink shadow-card ring-1 ring-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon size={18} className="pointer-events-none absolute right-3.5 text-ink-muted" />
              </label>
            </div>

            <div className="mt-4">
              {state === "loading" && (
                <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Načítavam miesta">
                  {Array.from({ length: 3 }, (_, i) => (
                    <PlaceCardSkeleton key={i} />
                  ))}
                </div>
              )}
              {state === "error" && <ErrorState onRetry={retry} />}
              {state === "ready" && results.length === 0 && <EmptyState query={query.trim()} onReset={resetFilters} radiusKm={maxKm} />}
              {state === "ready" && results.length > 0 && sponsored.length > 0 && (
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  {sponsored.map((p) => (
                    <SponsoredCard key={p.id} place={p} />
                  ))}
                </div>
              )}
              {state === "ready" && results.length > 0 && (
                <PlaceList
                  places={results}
                  savedHas={saved.has}
                  onToggleSave={toggleSave}
                  activeId={activeId}
                  cardRef={(id, el) => {
                    if (el) cardRefs.current.set(id, el);
                    else cardRefs.current.delete(id);
                  }}
                />
              )}
            </div>

            <p className="mt-8 text-center text-[12.5px] leading-relaxed text-ink-muted">
              Prototyp KUTISKO · všetky miesta sú skutočné. Ihriská z{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                © prispievatelia OpenStreetMap
              </a>
              ; herne a kútiky sme overili na weboch prevádzok. Hodnotenia rodičov zatiaľ nie sú.
              {promo.on && " Sponzorované miesto a akcie sú len vymyslená ukážka nápadu."}
              <br />
              {origin.kind === "gps"
                ? "Vzdialenosť počítame od vašej polohy. Poloha ostáva len v tomto zariadení, neukladáme ju."
                : `Vzdialenosť počítame vzdušnou čiarou od centra ${origin.of}.`}
            </p>
          </section>
        </main>
      </div>

      <CityPicker
        open={cityOpen}
        onClose={() => setCityOpen(false)}
        onPicked={(c) => showToast(`Vzdialenosti počítame od centra ${originFor(c).of}`)}
        onLocated={(status) => {
          if (status === "on") {
            setSort("distance");
            setCityOpen(false);
            showToast("Zoraďujeme od najbližšieho k vám");
          } else if (status === "outside") showToast(`Ste mimo pilotnej oblasti, počítame od centra ${origin.of}`);
        }}
      />
      <Toast message={toast} />

      <BottomNav />
    </>
  );
}
