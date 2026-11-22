import type { Metadata } from "next";
import { WelcomeScreen } from "@/components/auth/WelcomeScreen";

export const metadata: Metadata = { title: "Vitajte — KUTISKO (DEMO)" };

export default function Page() {
  return <WelcomeScreen />;
}
