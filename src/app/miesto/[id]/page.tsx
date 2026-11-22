import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PLACES } from "@/data/places";
import { PLACE_DETAILS } from "@/data/placeDetails";
import { PlaceDetailScreen, PlaceDetailSkeleton } from "@/components/detail/PlaceDetailScreen";

export function generateStaticParams() {
  return PLACES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/miesto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const place = PLACES.find((p) => p.id === id);
  return { title: place ? `${place.name} (DEMO) — KUTISKO` : "Miesto nenájdené — KUTISKO" };
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = PLACES.find((p) => p.id === id);
  const detail = PLACE_DETAILS[id];
  if (!place || !detail) notFound();
  return <PlaceDetailScreen place={place} detail={detail} />;
}

export default function Page({ params }: PageProps<"/miesto/[id]">) {
  return (
    <Suspense fallback={<PlaceDetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
