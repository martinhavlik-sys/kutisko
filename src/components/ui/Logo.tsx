import Image from "next/image";

/**
 * Logo KUTISKO (schválené 2026-11-23, variant G): slovo písmom Plus Jakarta Sans Bold,
 * „i“ tvoria 3 kocky a štvrtá kocka ako bodka. Zdroj: public/brand/, generátor scripts/logo/.
 * `tone="dark"` = biele písmo pre tmavé pozadie.
 */
const RATIO = 3512.3 / 867.3; // pomer strán viewBoxu SVG

export function Logo({ height = 24, tone = "light", className }: { height?: number; tone?: "light" | "dark"; className?: string }) {
  const src = tone === "dark" ? "/brand/logo-kutisko-tmave.svg" : "/brand/logo-kutisko.svg";
  return (
    <Image
      src={src}
      alt="Kutisko"
      width={Math.round(height * RATIO)}
      height={height}
      priority
      unoptimized
      className={className}
    />
  );
}
