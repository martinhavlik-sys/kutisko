import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PLACES } from "@/data/places";
import { ReviewForm } from "@/components/review/ReviewForm";

export const metadata: Metadata = { title: "Ohodnotiť miesto — KUTISKO (DEMO)" };

/** Vopred sa generujú len DEMO miesta; stovky ihrísk z OSM sa vykreslia na požiadanie. */
export function generateStaticParams() {
  return PLACES.filter((p) => p.isDemo).map((p) => ({ id: p.id }));
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = PLACES.find((p) => p.id === id);
  if (!place) notFound();
  return <ReviewForm place={place} />;
}

export default function Page({ params }: PageProps<"/miesto/[id]/hodnotit">) {
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-6 h-96 max-w-xl rounded-[26px]" aria-busy="true" />}>
      <Content params={params} />
    </Suspense>
  );
}
