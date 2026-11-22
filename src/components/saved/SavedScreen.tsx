"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PLACES } from "@/data/places";
import { useSaved } from "@/lib/saved";
import { placesLabel } from "@/lib/search";
import { BottomNav } from "@/components/ui/BottomNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast, useToast } from "@/components/ui/Toast";
import { PlaceCard, PlaceCardSkeleton } from "@/components/home/PlaceCard";

export function SavedScreen() {
  const saved = useSaved();
  const { message, show } = useToast();
  // localStorage je dostupný až v prehliadači — dovtedy zobrazíme skeleton, nie falošný prázdny stav.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const places = saved.ids.map((id) => PLACES.find((p) => p.id === id)).filter((p): p is (typeof PLACES)[number] => !!p);

  const remove = (id: string) => {
    const now = saved.toggle(id);
    show(now ? "Vrátené do obľúbených" : "Odstránené z obľúbených");
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-5 pb-32 sm:px-8">
        <PageHeader
          title="Obľúbené"
          subtitle={hydrated && places.length > 0 ? `${placesLabel(places.length)} · uložené iba v tomto prehliadači (DEMO)` : undefined}
        />
        <main className="mt-4">
          {!hydrated ? (
            <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
              <PlaceCardSkeleton />
            </div>
          ) : places.length === 0 ? (
            <div className="flex flex-col items-center rounded-[26px] bg-white px-6 py-10 text-center shadow-card ring-1 ring-line">
              <Image src="/illustrations/dieta-lopta.png" alt="" width={681} height={674} className="mb-2 h-auto w-[132px]" />
              <h2 className="text-[18px] font-semibold text-ink">Zatiaľ nemáte uložené miesta</h2>
              <p className="mt-1.5 max-w-xs text-[15px] leading-relaxed text-ink-muted">
                Ťuknite na srdiečko pri mieste, ktoré sa vám páči, a nájdete ho tu.
              </p>
              <Link
                href="/hladat"
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-coral-600 px-6 text-[15px] font-semibold text-white transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Objaviť miesta
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {places.map((p) => (
                <PlaceCard key={p.id} place={p} saved active={false} onToggleSave={remove} />
              ))}
            </div>
          )}
        </main>
      </div>
      <Toast message={message} />
      <BottomNav />
    </>
  );
}
