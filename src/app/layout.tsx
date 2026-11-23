import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PwaSetup } from "@/components/ui/PwaSetup";

// Pracovné písmo (návrh): Plus Jakarta Sans — priateľské, moderné, dobre čitateľné, plná podpora slovenčiny.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KUTISKO — detské kútiky, herne a ihriská",
  description:
    "Prototyp: objavujte detské kútiky, vnútorné herne a ihriská v Bratislave a okolí. Hodnotenia a účty sú zatiaľ len ukážka (DEMO).",
  robots: { index: false, follow: false },
  applicationName: "Kutisko",
  // Po „Pridať na plochu“ sa otvára na celú obrazovku; stavový riadok ostáva čitateľný na krémovom pozadí.
  appleWebApp: { capable: true, title: "Kutisko", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf7ee",
  // Aplikácia má len svetlý vzhľad; prehliadač (napr. tmavý režim Samsung Internet) ju nemá sám prefarbovať.
  colorScheme: "only light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <PwaSetup />
      </body>
    </html>
  );
}
