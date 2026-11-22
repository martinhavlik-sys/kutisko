import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Prihlásenie — KUTISKO (DEMO)" };

export default function Page() {
  return <AuthForm mode="login" />;
}
