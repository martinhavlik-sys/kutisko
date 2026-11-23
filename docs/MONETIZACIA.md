# Sponzorované miesta a akcie — nápad a ukážka

> **Stav:** len nápad Martina (23. 11. 2026) a vzorová ukážka v prototype. Nič z toho nie je rozhodnuté.
> Manifest aj roadmapa majú reklamu, platené profily a účty prevádzok **mimo MVP**; ukážka to nemení.
> Ceny a pravidlá rozhodne Martin. Nižšie je iba návrh na diskusiu.

## Čo je v prototype (ukážka)

- **Sponzorované miesto vpredu (Domov):** nad zoznamom „Miesta v okolí“ jedna karta so štítkom **„Sponzorované“** a **„Ukážka“**.
  Ide o vymyslenú „Ukážkovú herňu“ / „Ukážkový kútik“, nie o skutočnú prevádzku. Ukáže sa len vtedy, keď zodpovedá
  zvolenej kategórii, veku a hľadanému textu. Na mape ani v zozname miest nie je.
- **Akcie v najbližších dňoch (Domov):** pás pod mapou s vymyslenými akciami na najbližších 14 dní (dátumy sa
  posúvajú s dneškom). Každá má štítok „Ukážka“. Tlačidlo „Skryť ukážku“ všetko skryje.
- **Stránka „Pre prevádzky“ (`/pre-prevadzky`):** čo uvidia rodičia, návrh zásad, zoznam akcií a ukážkový
  formulár „Pridať akciu“ (názov, deň do 14 dní, čas, poznámka). Uloží sa len v prehliadači.
- **Jeden prepínač:** Profil → „Ukážka: sponzorované miesta a akcie“. Od 23.11. predvolene **vypnuté** (pred testom s rodičmi,
  rozhodnutie Martina); zapne sa v Profile. Predvolenú hodnotu určuje `PROMO_DEMO_DEFAULT_ON` v `src/lib/promoDemo.ts`.

Žiadne platby, žiadny server, žiadne skutočné akcie reálnych herní.

## Návrh zásad (aby reklama nezavádzala rodičov)

1. Každá platená pozícia má vždy viditeľný text **„Sponzorované“** (nielen farbu či ikonku).
2. Najviac **1** sponzorované miesto nad výsledkami; nikdy nie medzi nimi tak, aby sa nedalo odlíšiť.
3. Sponzorované miesto sa ukáže len, keď **zodpovedá filtrom** (kategória, vek, okruh). Inak radšej nič.
4. Platba **nemení** hodnotenia rodičov, poradie „Odporúčané“, filtre ani „Overené“.
5. Akcie: najviac **14 dní** dopredu, konkrétny dátum a čas, **kontrola pred zverejnením** (rovnako ako recenzie),
   po skončení zmiznú. Žiadne fotky detí.
6. Rodič si vie akcie skryť; sponzorovanú kartu môže nahlásiť ako nevhodnú.
7. Pred spustením: overiť povinnosti podľa zákona o reklame a DSA (označenie reklamy, kto platí).

## Otázky na rozhodnutie (Martin)

- **Model:** mesačný paušál za „vpredu“ v lokalite × platba za akciu × balík (profil + akcie)? Bezplatné akcie
  pre všetky prevádzky a platené len zvýraznenie?
- **Cenník:** pilotná cena / prvé mesiace zadarmo pre prvé herne v Bratislave?
- **Kto môže pridávať akcie:** len overené prevádzky s účtom (účty prevádzok sú dnes mimo MVP).
- **Kde všade:** len Domov, alebo aj Hľadať a detail miesta?
- ~~**Ukážka pri teste s rodičmi:** nechať zapnutú, alebo pred testom vypnúť?~~ Rozhodnuté 23.11.: vypnúť.

## Technické poznámky

- Logika (výber sponzorovaného miesta, okno 14 dní, kontrola formulára): `src/lib/promo.ts` + testy `promo.test.ts`.
- Vymyslené údaje: `src/data/promoDemo.ts`. Prepínač a pridané akcie (localStorage): `src/lib/promoDemo.ts`.
- UI: `src/components/promo/`.
