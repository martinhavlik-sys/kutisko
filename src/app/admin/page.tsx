import type { Metadata } from "next";
import { AdminScreen } from "@/components/admin/AdminScreen";

export const metadata: Metadata = { title: "Admin fronta — náhľad (DEMO)" };

export default function Page() {
  return <AdminScreen />;
}
