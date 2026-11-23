/**
 * UKÁŽKOVÉ (vymyslené) údaje pre nápad „sponzorované miesta a akcie“.
 * Prevádzky ani akcie neexistujú; názvy sú zámerne „Ukážková …“, aby sa nedali pomýliť
 * so skutočnou herňou. Na mape ani vo vyhľadávaní sa nezobrazujú.
 */
import { addDays, type PromoEvent, type PromoPlace } from "../lib/promo.ts";

export const PROMO_PLACES: PromoPlace[] = [
  {
    id: "ukazka-herna",
    name: "Ukážková herňa",
    category: "herna",
    area: "Bratislava",
    ageMin: 2,
    ageMax: 10,
    tagline: "Takto by vyzeralo sponzorované miesto vpredu",
  },
  {
    id: "ukazka-kutik",
    name: "Ukážkový kútik",
    category: "kutik",
    area: "Bratislava",
    ageMin: 0,
    ageMax: 5,
    tagline: "Takto by vyzeral sponzorovaný kútik",
  },
];

/** Ukážkové akcie, vždy relatívne k dnešku, aby ukážka nikdy „nezostarla“. */
export function demoEvents(today: string): PromoEvent[] {
  return [
    { id: "ua-1", placeId: "ukazka-herna", title: "Maľovanie na tvár", date: addDays(today, 1), time: "15:00 – 17:00", note: "V cene vstupu" },
    { id: "ua-2", placeId: "ukazka-kutik", title: "Dopoludnie pre najmenších", date: addDays(today, 3), time: "9:30", note: "Pre deti 0–3 roky" },
    { id: "ua-3", placeId: "ukazka-herna", title: "Rozprávkové popoludnie", date: addDays(today, 6), time: "16:00", note: "Treba rezerváciu" },
    { id: "ua-4", placeId: "ukazka-kutik", title: "Tvorivá dielňa s farbami", date: addDays(today, 10), time: "10:00 – 12:00", note: null },
  ];
}

export function promoPlaceName(id: string): string {
  return PROMO_PLACES.find((p) => p.id === id)?.name ?? "Ukážková prevádzka";
}
