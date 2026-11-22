import type { Metadata } from "next";
import { SavedScreen } from "@/components/saved/SavedScreen";

export const metadata: Metadata = { title: "Obľúbené — KUTISKO (DEMO)" };

export default function Page() {
  return <SavedScreen />;
}
