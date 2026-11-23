"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createDemoStore } from "./demoStore";
import { bratislavaDate, type PromoEvent } from "./promo";
import { demoEvents } from "@/data/promoDemo";

/**
 * JEDEN PREPÍNAČ pre celú ukážku sponzorovaných miest a akcií.
 * Predvolená hodnota platí pre všetkých; v Profile si ju dá každý prepnúť (uloží sa v prehliadači).
 * Na vypnutie pre všetkých (napr. pred testom s rodičmi) stačí zmeniť na `false`.
 */
export const PROMO_DEMO_DEFAULT_ON = true;

const settings = createDemoStore<{ on: boolean | null }>("kutisko.demo.promo", { on: null });
const added = createDemoStore<PromoEvent[]>("kutisko.demo.promoEvents", []);

export function usePromoDemo() {
  const [s, setS] = settings.useStore();
  const on = s.on ?? PROMO_DEMO_DEFAULT_ON;
  return { on, setOn: (v: boolean) => setS(() => ({ on: v })) };
}

/** Akcie pridané v ukážkovom formulári (iba v tomto prehliadači). */
export function useAddedEvents() {
  return added.useStore();
}

const noop = () => () => {};
/** Dnešok v Bratislave; na serveri prázdny reťazec (ukážka sa vykreslí až v prehliadači). */
export function useToday(): string {
  return useSyncExternalStore(noop, () => bratislavaDate(new Date()), () => "");
}

/** Všetky ukážkové akcie: vzorové + pridané v tomto prehliadači. */
export function useAllDemoEvents(today: string): PromoEvent[] {
  const [mine] = useAddedEvents();
  return useMemo(() => (today ? [...mine, ...demoEvents(today)] : []), [mine, today]);
}
