/**
 * Galéria miesta — čistá logika bez Reactu (testovateľná cez `node --test`).
 *
 * Zdroj fotiek je zámerne na jednom mieste: dnes sú to len DEMO fotky z tohto prehliadača
 * (pridané cez „Pridať fotku“ alebo pri hodnotení), katalóg je prázdny. Keď bude rozhodnuté
 * úložisko (DECISIONS.md), stačí naplniť `catalog` adresami z úložiska — obrazovky sa nemenia.
 */

export type PhotoStatus = "pending" | "approved" | "rejected";

export interface PlacePhoto {
  id: string;
  placeId: string;
  /** Adresa obrázka (dnes data URL z prehliadača, neskôr URL z úložiska). */
  src: string;
  /** Popis pre čítačky obrazovky. */
  alt: string;
  /** Kto fotku pridal: rodič (moderované), prevádzka alebo tím KUTISKO. */
  origin: "parent" | "operator" | "kutisko";
  status: PhotoStatus;
  /** Fotku pridal tento používateľ (v prototype: tento prehliadač). */
  mine: boolean;
  addedAt: string;
}

/** Najviac čakajúcich fotiek od jedného používateľa na miesto (ochrana pred zahltením fronty aj úložiska prehliadača). */
export const MAX_PENDING_PER_PLACE = 5;

export interface GalleryView {
  /** Zverejnené fotky — vidí ich každý (hlavný obrázok aj galéria). */
  published: PlacePhoto[];
  /** Moje fotky, ktoré ešte nie sú zverejnené — vidím ich len ja, so stavom. */
  mineUnpublished: PlacePhoto[];
}

/**
 * Zostaví galériu miesta. Zverejnené sú len schválené fotky; najnovšie prvé,
 * fotky prevádzky a tímu pred rodičovskými (zvyčajne lepšie ukazujú celý priestor).
 */
export function buildGallery(placeId: string, sources: PlacePhoto[][]): GalleryView {
  const seen = new Set<string>();
  const all: PlacePhoto[] = [];
  for (const list of sources) {
    for (const p of list) {
      if (p.placeId !== placeId || seen.has(p.id)) continue;
      seen.add(p.id);
      all.push(p);
    }
  }
  const rank = (p: PlacePhoto) => (p.origin === "parent" ? 1 : 0);
  const byDate = (a: PlacePhoto, b: PlacePhoto) => rank(a) - rank(b) || b.addedAt.localeCompare(a.addedAt);
  return {
    published: all.filter((p) => p.status === "approved").sort(byDate),
    mineUnpublished: all.filter((p) => p.mine && p.status !== "approved").sort(byDate),
  };
}

export function canAddPhoto(view: GalleryView): boolean {
  return view.mineUnpublished.filter((p) => p.status === "pending").length < MAX_PENDING_PER_PLACE;
}

export function photosLabel(n: number): string {
  if (n === 1) return "1 fotka";
  if (n >= 2 && n <= 4) return `${n} fotky`;
  return `${n} fotiek`;
}

/** Fotky z katalógu (prevádzka / tím). Zatiaľ prázdne — úložisko nie je rozhodnuté. */
export const CATALOG_PHOTOS: PlacePhoto[] = [];
