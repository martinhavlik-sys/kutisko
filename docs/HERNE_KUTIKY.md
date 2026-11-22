# Herne a kútiky — overené miesta a kandidáti

Stav k 22. 11. 2026. Dáta: `src/data/curated/indoor-places.json`.

## Pravidlá zberu (licenčná a právna čistota)
- Fakty (názov, adresa, otváracie hodiny, cena, vek, vybavenie) beriem **len z webu prevádzky alebo obchodného centra**. Fakty nie sú autorské dielo; zdroj je uvedený pri každom mieste v aplikácii.
- **Žiadne údaje z Google** (Mapy, Places, recenzie), žiadne fotky ani logá, žiadne kopírované texty. Popisy sú vlastné, krátke a vecné.
- Žiadne vymyslené hodnotenia. Údaj, ktorý prevádzka neuvádza, ostáva prázdny („neuvedené“, „Cena neoverená“).
- Do aplikácie ide len miesto, ktorého web je **aktuálny** (dátum 2026 alebo udalosti v 2026). Agregátory (sdetmi.com, zlavomat.sk, kidsmap.com, multi-sport.sk, citylife.sk) slúžili len na nájdenie kandidátov, nie ako zdroj údajov.
- Poloha: presná z OpenStreetMap (Nominatim, ODbL) cez `scripts/curated/geocode.mjs`. Kým sa nespustí, bod na mape je **približný** a aplikácia to v detaile hovorí; navigácia vtedy vedie na adresu prevádzky.

## V aplikácii (11)
| Miesto | Typ | Lokalita | Zdroj | Chýba na webe |
|---|---|---|---|---|
| MINI CITY | herňa | Rača | minicity.sk | — |
| Simba Centrum | herňa | Petržalka | simbacentrum.sk | či sú ceny detské |
| Jump Fun Nivy | herňa | Ružinov (OC Nivy) | jumpfun.sk/nivy | vek |
| Jump Fun KidsHouse (pri letisku) | herňa | Ružinov | jumpfun.sk/kidshouse | vek, či je cena detská |
| RETRO Kids | herňa | Ružinov (OC Retro) | retrokids.sk | vek |
| INSPIRO Park oddychu | kútik pri kaviarni | Ivanka pri Dunaji | park-oddychu.sk | vek |
| Adventica Eurovea | herňa | Staré Mesto | eurovea.sk | cena |
| Detské ihrisko v Eurovei | kútik | Staré Mesto | eurovea.sk | cena |
| Detský kútik Aupark | strážený kútik | Petržalka | aupark-bratislava.sk | cena, hodiny |
| BUPPI Detský svet (Bory Mall) | herňa | Lamač | borymall.sk | cena, vek |
| AVION Junior | strážený kútik | Ružinov | avion.sk | cena, hodiny |

## Kandidáti na overenie (zatiaľ nezobrazené)
Dôvod: web prevádzky sa nedal prečítať, je zastaraný, alebo existuje len zmienka na agregátore.

| Miesto | Kde sme ho našli | Dôvod |
|---|---|---|
| Funcity (OC Cubicon, Staré Grunty 24) | bratislavak.sk, sdetmi.com | web funcity.sk sa nedá prečítať bez JavaScriptu |
| Funtázia Nivy (kútik v kaviarni, OC Nivy) | multi-sport.sk | zdroj z roku 2024, web funtazianivy.sk neoverený |
| Detské centrum Ihrisko (Halašova 25/A) | kidsmap.com | web s obsahom z rokov 2012–2018, možno zatvorené |
| Kids World Senec (Trnavská cesta 35) | zlavomat.sk | web nedostupný, ponuky len do 2023 |
| Jump Arena (Ivanská cesta 30/D) | multi-sport.sk | zrejme súčasť Jump Fun (pri letisku), overiť |
| BUPPI v Avione a na Zlatých pieskoch | sdetmi.com, avion.sk (menu) | samostatné stránky neoverené |
| Avion Playtime, Avion Edukáčik | avion.sk | stránky bez hodín, ceny a veku |
| Time Out v Bory Mall a OC Central | sdetmi.com, borymall.sk | len zmienka bez údajov |
| Zahrajkovo (OC Molo, Pezinok) | sdetmi.com | web nenájdený |
| Country Kids House, Space Mania, Sunsibar (Senec) | sdetmi.com | web nenájdený |
| Miracolo (Fedinova 20, Petržalka), Maxiland (Jarabinkova 8/F) | sdetmi.com | web nenájdený |
| LEGIONÁRIK (OC Danubia), Kiki Waikiki Land, Hopsasa, Woow Toys | sdetmi.com, citylife.sk | web nenájdený, staré zdroje |

Ďalší krok: overiť kandidátov priamo u prevádzok (telefón/e-mail) alebo ich nechať pridať cez „Navrhnúť miesto“; pri spolupráci požiadať prevádzky o súhlas s fotkami.
