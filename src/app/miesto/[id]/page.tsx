import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PLACES } from "@/data/places";
import { getPlaceDetail } from "@/data/placeDetails";
import { PlaceDetailScreen, PlaceDetailSkeleton } from "@/components/detail/PlaceDetailScreen";

/** Vopred sa generujú len herne a kútiky; stovky ihrísk z OSM sa vykreslia na požiadanie. */
export function generateStaticParams() {
  return PLACES.filter((p) => p.source === "web").map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/miesto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const place = PLACES.find((p) => p.id === id);
  return { title: place ? `${place.name}${place.isDemo ? " (DEMO)" : ""} — KUTISKO` : "Miesto nenájdené — KUTISKO" };
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = PLACES.find((p) => p.id === id);
  if (!place) notFound();
  const detail = getPlaceDetail(place);
  if (!detail) notFound();
  return <PlaceDetailScreen place={place} detail={detail} />;
}

export default function Page({ params }: PageProps<"/miesto/[id]">) {
  return (
    <Suspense fallback={<PlaceDetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
