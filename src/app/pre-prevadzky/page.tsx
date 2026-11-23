import type { Metadata } from "next";
import { BusinessDemoScreen } from "@/components/promo/BusinessDemoScreen";

export const metadata: Metadata = { title: "Pre prevádzky — ukážka nápadu — KUTISKO (DEMO)" };

export default function Page() {
  return <BusinessDemoScreen />;
}
