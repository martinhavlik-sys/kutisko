import type { MetadataRoute } from "next";

/**
 * PWA manifest — inštalácia na plochu iPhonu („Pridať na plochu“) aj Androidu
 * (Chrome / Samsung Internet „Inštalovať aplikáciu“) a otváranie na celú obrazovku.
 *
 * Ikony: schválené logo s kockami (2026-11-23). Pri výmene stačí prepísať súbory
 * v public/icons/ rovnakými názvami a rozmermi — pozri docs/IKONY.md.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Stabilná identita aplikácie: Android podľa nej spozná, že ide o tú istú aplikáciu aj po zmene start_url.
    id: "/",
    name: "KUTISKO (DEMO)",
    short_name: "Kutisko",
    description: "Prototyp: detské kútiky, herne a ihriská v Bratislave a okolí. Hodnotenia a účty sú zatiaľ len ukážka.",
    lang: "sk",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Krémová: farba úvodnej obrazovky (splash) na Androide a horného pruhu v okne aplikácie.
    background_color: "#fbf7ee",
    theme_color: "#fbf7ee",
    categories: ["lifestyle", "travel", "kids"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android oreže ikonu do kruhu / zaobleného štvorca; dôležitý obsah musí byť v strednom kruhu (80 %).
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Dlhé podržanie ikony na ploche Androidu ponúkne rýchle skratky.
    shortcuts: [
      {
        name: "Hľadať miesto",
        short_name: "Hľadať",
        url: "/hladat",
        icons: [{ src: "/icons/shortcut-search-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Obľúbené miesta",
        short_name: "Obľúbené",
        url: "/ulozene",
        icons: [{ src: "/icons/shortcut-heart-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
