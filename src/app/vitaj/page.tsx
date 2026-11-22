import type { Metadata } from "next";
import { Suspense } from "react";
import { WelcomeScreen } from "@/components/auth/WelcomeScreen";

export const metadata: Metadata = { title: "Vitajte — KUTISKO (DEMO)" };

export default function Page() {
  return (
    <Suspense>
      <WelcomeScreen />
    </Suspense>
  );
}
