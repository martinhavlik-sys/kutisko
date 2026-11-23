import type { MetadataRoute } from "next";

/**
 * PWA manifest — umožní pridať prototyp na plochu iPhonu („Pridať na plochu“)
 * a otvárať ho na celú obrazovku. Ikona je dočasná (logo nie je finálne).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KUTISKO (DEMO)",
    short_name: "Kutisko",
    description: "Prototyp: detské kútiky, herne a ihriská v Bratislave a okolí. Hodnotenia a účty sú zatiaľ len ukážka.",
    lang: "sk",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf7ee",
    theme_color: "#fbf7ee",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
