import type { Metadata } from "next";
import { SuggestForm } from "@/components/suggest/SuggestForm";

export const metadata: Metadata = { title: "Navrhnúť miesto — KUTISKO (DEMO)" };

export default function Page() {
  return <SuggestForm />;
}
