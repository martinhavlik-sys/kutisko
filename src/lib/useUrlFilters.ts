"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AGE_BANDS, CATEGORIES, type CategoryId } from "@/data/places";
import type { Environment, Filters, SortId } from "./search";

export type View = "list" | "map";

export interface UrlFilters {
  query: string;
  category: CategoryId | null;
  ageId: string | null;
  environment: Environment;
  amenities: string[];
  onlyVerified: boolean;
  onlyFree: boolean;
  sort: SortId;
  view: View;
}

const SORTS: SortId[] = ["recommended", "distance", "rating"];

/** Filtre rozšíreného vyhľadávania sú v URL — dajú sa zdieľať a prežijú obnovenie stránky. */
export function useUrlFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state: UrlFilters = useMemo(() => {
    const cat = params.get("kat");
    const age = params.get("vek");
    const env = params.get("prostredie");
    const sort = params.get("zoradit") as SortId | null;
    return {
      query: params.get("q") ?? "",
      category: CATEGORIES.some((c) => c.id === cat) ? (cat as CategoryId) : null,
      ageId: AGE_BANDS.some((b) => b.id === age) ? age : null,
      environment: env === "vnutri" ? "indoor" : env === "vonku" ? "outdoor" : "all",
      amenities: (params.get("vybavenie") ?? "").split(",").filter(Boolean),
      onlyVerified: params.get("overene") === "1",
      onlyFree: params.get("zadarmo") === "1",
      sort: sort && SORTS.includes(sort) ? sort : "recommended",
      view: params.get("zobrazenie") === "mapa" ? "map" : "list",
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<UrlFilters>) => {
      const next = { ...state, ...patch };
      const sp = new URLSearchParams();
      if (next.query.trim()) sp.set("q", next.query);
      if (next.category) sp.set("kat", next.category);
      if (next.ageId) sp.set("vek", next.ageId);
      if (next.environment !== "all") sp.set("prostredie", next.environment === "indoor" ? "vnutri" : "vonku");
      if (next.amenities.length) sp.set("vybavenie", next.amenities.join(","));
      if (next.onlyVerified) sp.set("overene", "1");
      if (next.onlyFree) sp.set("zadarmo", "1");
      if (next.sort !== "recommended") sp.set("zoradit", next.sort);
      if (next.view === "map") sp.set("zobrazenie", "mapa");
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [state, router, pathname],
  );

  const filters: Filters = useMemo(
    () => ({
      query: state.query,
      category: state.category,
      ageBand: AGE_BANDS.find((b) => b.id === state.ageId) ?? null,
      sort: state.sort,
      environment: state.environment,
      amenities: state.amenities,
      onlyVerified: state.onlyVerified,
      onlyFree: state.onlyFree,
    }),
    [state],
  );

  const advancedCount =
    (state.environment !== "all" ? 1 : 0) + state.amenities.length + (state.onlyVerified ? 1 : 0) + (state.onlyFree ? 1 : 0);

  const reset = useCallback(() => {
    router.replace(state.view === "map" ? `${pathname}?zobrazenie=mapa` : pathname, { scroll: false });
  }, [router, pathname, state.view]);

  return { state, filters, update, reset, advancedCount };
}
