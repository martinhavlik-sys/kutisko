import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchScreen, SearchSkeleton } from "@/components/search/SearchScreen";

export const metadata: Metadata = { title: "Hľadať — KUTISKO (DEMO)" };

export default function Page() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchScreen />
    </Suspense>
  );
}
