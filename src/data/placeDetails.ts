/**
 * SYNTETICKÉ DEMO DÁTA pre detail miesta — vymyslené popisy, hodiny,
 * čiastkové hodnotenia a ukážkové recenzie. Recenzie nepatria žiadnym
 * skutočným osobám a nie sú skutočnými skúsenosťami.
 */

export interface Criteria {
  /** Čistota priestoru 1–10 */
  cleanliness: number;
  /** Kreativita priestoru 1–10 */
  creativity: number;
  /** Celkový dojem 1–10 */
  overall: number;
}

export interface DemoReview {
  author: string;
  score: number;
  text: string;
  when: string;
}

export interface PlaceDetail {
  description: string;
  /** Týždenné hodiny, null = neoverené. */
  hoursWeek: { days: string; hours: string }[] | null;
  criteria: Criteria | null;
  reviews: DemoReview[];
}

const weekdays = (wk: string, we: string) => [
  { days: "Po – Pi", hours: wk },
  { days: "So – Ne", hours: we },
];

export const PLACE_DETAILS: Record<string, PlaceDetail> = {
  "demo-01": {
    description:
      "Malý kútik pri kaviarni v centre. Rodičia sedia pri stoloch s výhľadom na hraciu plochu, deti majú mäkké kocky, kuchynku a kútik na kreslenie.",
    hoursWeek: weekdays("9:00 – 19:00", "10:00 – 18:00"),
    criteria: { cleanliness: 9.1, creativity: 8.4, overall: 8.9 },
    reviews: [
      { author: "Rodič (DEMO)", score: 9, text: "Ukážková recenzia: príjemná káva a dobrý prehľad o deťoch.", when: "pred 2 týždňami" },
      { author: "Rodič (DEMO)", score: 8, text: "Ukážková recenzia: cez víkend býva plno, odporúčame prísť skoro.", when: "pred mesiacom" },
    ],
  },
  "demo-02": {
    description:
      "Veľká vnútorná herňa s trampolínami, prekážkovou dráhou a oddelenou zónou pre menšie deti. Vhodná aj na narodeninové oslavy.",
    hoursWeek: weekdays("10:00 – 20:00", "9:00 – 20:00"),
    criteria: { cleanliness: 8.8, creativity: 9.4, overall: 9.2 },
    reviews: [
      { author: "Rodič (DEMO)", score: 10, text: "Ukážková recenzia: deti sa vybláznili, personál bol ochotný.", when: "pred týždňom" },
      { author: "Rodič (DEMO)", score: 9, text: "Ukážková recenzia: oslava bola bez starostí, parkovanie priamo pred vchodom.", when: "pred 3 týždňami" },
    ],
  },
  "demo-03": {
    description:
      "Tiché sídliskové ihrisko v tieni líp s pieskoviskom, hojdačkami a nízkou šmykľavkou. Okolo sú lavičky pre rodičov.",
    hoursWeek: null,
    criteria: { cleanliness: 7.6, creativity: 7.9, overall: 8.1 },
    reviews: [
      { author: "Rodič (DEMO)", score: 8, text: "Ukážková recenzia: v lete príjemný tieň, pieskovisko by mohlo byť čistejšie.", when: "pred mesiacom" },
    ],
  },
  "demo-04": {
    description:
      "Kútik pre najmenších s Montessori hračkami a tichým priestorom na kojenie. Údaje zatiaľ neoveril kurátor.",
    hoursWeek: weekdays("8:30 – 18:00", "zatvorené"),
    criteria: { cleanliness: 8.0, creativity: 7.2, overall: 7.6 },
    reviews: [
      { author: "Rodič (DEMO)", score: 8, text: "Ukážková recenzia: ideálne pre batoľatá, väčšie deti sa tu nudia.", when: "pred 2 mesiacmi" },
    ],
  },
  "demo-05": {
    description:
      "Lezecká herňa s nízkymi boulderingovými stenami a inštruktorom. Pre deti od 5 rokov, menšie deti len so sprievodom.",
    hoursWeek: weekdays("13:00 – 21:00", "9:00 – 21:00"),
    criteria: { cleanliness: 8.5, creativity: 8.9, overall: 8.7 },
    reviews: [
      { author: "Rodič (DEMO)", score: 9, text: "Ukážková recenzia: inštruktor sa deťom naozaj venoval.", when: "pred 5 dňami" },
    ],
  },
  "demo-06": {
    description:
      "Lesné ihrisko na okraji Dúbravky s lanovou dráhou, drevenými prvkami a pitnou vodou. Údaje zatiaľ neoverené.",
    hoursWeek: null,
    criteria: { cleanliness: 8.7, creativity: 9.3, overall: 9.0 },
    reviews: [
      { author: "Rodič (DEMO)", score: 9, text: "Ukážková recenzia: krásne prostredie, vezmite si repelent.", when: "pred 3 týždňami" },
    ],
  },
  "demo-07": {
    description: "Nový kútik v kaviarni. Zatiaľ bez hodnotení a bez overených údajov o cene a hodinách.",
    hoursWeek: null,
    criteria: null,
    reviews: [],
  },
  "demo-08": {
    description:
      "Rodinná herňa pri jazere s tobogánom, bazénom s loptičkami a bistrom. Vhodná ako cieľ víkendového výletu.",
    hoursWeek: weekdays("9:00 – 20:00", "9:00 – 20:00"),
    criteria: { cleanliness: 7.5, creativity: 8.2, overall: 7.9 },
    reviews: [
      { author: "Rodič (DEMO)", score: 8, text: "Ukážková recenzia: veľa priestoru, v bistre dlhšie čakanie.", when: "pred 2 týždňami" },
    ],
  },
  "demo-09": {
    description: "Ihrisko pri cyklotrase s pieskoviskom a hojdačkami. Dobrá zastávka počas výletu na bicykli.",
    hoursWeek: null,
    criteria: { cleanliness: 8.2, creativity: 7.8, overall: 8.4 },
    reviews: [
      { author: "Rodič (DEMO)", score: 8, text: "Ukážková recenzia: pokojné miesto, chýba toaleta.", when: "pred mesiacom" },
    ],
  },
  "demo-10": {
    description:
      "Útulný kútik pre batoľatá so záhradou. Menšia kapacita, preto býva pokojnejší ako herne v meste.",
    hoursWeek: weekdays("9:00 – 17:00", "9:00 – 13:00"),
    criteria: { cleanliness: 9.6, creativity: 9.0, overall: 9.4 },
    reviews: [
      { author: "Rodič (DEMO)", score: 10, text: "Ukážková recenzia: veľmi čisté, milá obsluha.", when: "pred týždňom" },
    ],
  },
  "demo-11": {
    description: "Mestské ihrisko s vodnými prvkami, ktoré fungujú v letnej sezóne. Toalety sú v blízkej budove.",
    hoursWeek: weekdays("9:00 – 20:00", "9:00 – 20:00"),
    criteria: { cleanliness: 6.9, creativity: 7.6, overall: 7.2 },
    reviews: [
      { author: "Rodič (DEMO)", score: 7, text: "Ukážková recenzia: v lete super, mimo sezóny bez vody.", when: "pred 2 mesiacmi" },
    ],
  },
};
