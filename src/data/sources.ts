/**
 * Povolenie použiť externé zdroje dát v aplikácii.
 *
 * Mestský register športovísk (geoportal.bratislava.sk) sa zobrazí až po overení licencie
 * konkrétnej vrstvy. Rozhodnutie Martina 2026-11-22: zobrazovať len údaje, ktoré smieme použiť;
 * ostatné ihriská ostanú v zozname docs/MESTSKE_IHRISKA.md na oslovenie mesta.
 * Zmena na `true` patrí do DECISIONS.md spolu s dôkazom licencie.
 */
export const CITY_REGISTER = {
  approved: false,
  license: null as string | null,
  attribution: "Hlavné mesto SR Bratislava",
  licenseUrl: null as string | null,
};
