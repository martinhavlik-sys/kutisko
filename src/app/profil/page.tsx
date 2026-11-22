import type { Metadata } from "next";
import { ProfileScreen } from "@/components/profile/ProfileScreen";

export const metadata: Metadata = { title: "Profil — KUTISKO (DEMO)" };

export default function Page() {
  return <ProfileScreen />;
}
