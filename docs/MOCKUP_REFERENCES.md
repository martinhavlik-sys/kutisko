# Pôvodné grafické mockupy — textová referencia

Stav: 2026-11-22. Zdroj: súbory vlastníka `app kutisko.ai`, `app kutisko.psd`, `kutisko mockup.pptx`.
Mockupy sú **len referencie** (CLAUDE.md); logo nie je finálne.

> Obrázky mockupov sa do tohto verejného repozitára zámerne **nenahrávajú**: obsahujú originálnu ilustráciu
> (dievčatko s kockami), ktorú bez výslovného súhlasu nepublikujeme. PNG/PDF náhľady sú v súkromných
> súboroch projektu, priečinok `mockups/`.

## app kutisko.ai (5 artbordov, 1125 × 2436, iPhone)
1. **Úvod / prihlásenie** — amber pozadie, ilustrácia v krémovom ovále, logotyp „Kutisko“ (ručné písmo, ružová),
   tlačidlá „Prihlásiť sa“ (plné ružové) / „alebo“ / „Zaregistrovať sa“ (krémové).
2. **Domov s mapou a zoznamom** — vyhľadávacie pole „Kam ideme?“, mapa Bratislavy s pinmi, ružové
   tlačidlo „Zoradiť podľa vzdialenosti“, zoznam miest (názov, vzdialenosť, adresa, e-mail, telefón,
   otváracie hodiny), spodná navigácia: Domov · Hľadať · Obľúbené · Profil (amber lišta).
3. **Domov bez mapy** — rovnaký layout, pole s textom „Bratislava“, mapa nenačítaná (prázdna plocha).
4.–5. Prázdne rámce (len status bar).

Pozn.: ceny na pinoch mapy (€1 580 …) sú prevzaté z cudzej šablóny, nie produktové údaje.

## app kutisko.psd — paleta
| Farba | HEX |
|---|---|
| krémová (pozadie) | `#F7F1E1` |
| koralovo-ružová (CTA) | `#FF526E` |
| amber (navigácia, úvod) | `#F5AD1D` |
| tyrkysová | `#5DC2D6` |
| čierna (text) | `#000000` |

## kutisko mockup.pptx (18 snímok) — informačná architektúra
- **Úvod**: uvítacia stránka sa zobrazí na chvíľu pri každom otvorení, text „Ahoj [meno]“; vizuál celej appky bude kreslený.
- **Dashboard (1. stránka)**: vyhľadávací search bar, mapa s kútikmi, filter zoradenia, zoznam kútikov (radenie podľa filtra).
- **2. stránka**: rozšírené vyhľadávanie po zadaní textu, ako Booking — horné menu (zoradiť, filtrovať, mapa) + zoznam.
- **Listing (3. stránka)**: detail ako Booking — názov + foto, hodnotenie + počet recenzií, popis, poloha na mape + adresa, ikony ponuky, cena.
- **Ponuka kútika** (vypĺňa prevádzka v rámci svojho konta): názov, fotografie, textový opis, adresa, cena; ikony napr.
  káva/snack, priestor na oslavy, vonkajšie ihrisko, prebaľovací pult, detské menu, animátor, stráženie, Montessori…
- **Menu**: jednoduché spodné menu na každej stránke — Hľadať, Uložené/Obľúbené, Profil.
- **Profil (4. stránka)**: základné údaje, nastavenia vyhľadávania (cieľ…), heslo, moje hodnotenia.
