"use client";

import Image from "next/image";
import { useBackButtonClose } from "@/lib/pwa";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Place } from "@/data/places";
import { addPhotoUpload, useMyReviews, usePhotoUploads } from "@/lib/community";
import { buildGallery, canAddPhoto, CATALOG_PHOTOS, MAX_PENDING_PER_PLACE, photosLabel, type GalleryView, type PlacePhoto } from "@/lib/gallery";
import { PlaceArt } from "@/components/home/PlaceArt";
import { CloseIcon } from "@/components/home/icons";
import { FieldError, PhotoPicker, primaryBtn } from "@/components/forms/FormParts";

/* ---------- dáta ---------- */

/** Spojí katalóg (zatiaľ prázdny) s DEMO fotkami z tohto prehliadača. */
export function usePlaceGallery(place: Place): GalleryView {
  const [uploads] = usePhotoUploads();
  const [reviews] = useMyReviews();
  return useMemo(() => {
    const alt = `Fotka miesta ${place.name}`;
    const fromUploads: PlacePhoto[] = uploads.map((u) => ({
      id: `p:${u.id}`,
      placeId: u.placeId,
      src: u.photo.dataUrl,
      alt,
      origin: "parent",
      status: u.photo.status,
      mine: true,
      addedAt: u.createdAt,
    }));
    const fromReviews: PlacePhoto[] = reviews
      .filter((r) => r.photo)
      .map((r) => ({
        id: `r:${r.id}`,
        placeId: r.placeId,
        src: r.photo!.dataUrl,
        alt,
        origin: "parent",
        status: r.photo!.status,
        mine: true,
        addedAt: r.createdAt,
      }));
    return buildGallery(place.id, [CATALOG_PHOTOS, fromUploads, fromReviews]);
  }, [place.id, place.name, uploads, reviews]);
}

const originLabel = (p: PlacePhoto) =>
  p.origin === "operator" ? "Fotka od prevádzky" : p.origin === "kutisko" ? "Fotka tímu KUTISKO" : p.mine ? "Vaša fotka" : "Fotka od rodiča";

const statusLabel = (p: PlacePhoto) =>
  p.status === "pending" ? "Čaká na schválenie · vidíte ju len vy" : p.status === "rejected" ? "Neschválená · vidíte ju len vy" : null;

/* ---------- ikonky ---------- */

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7"} />
    </svg>
  );
}

function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.3l1.4-2h5.6l1.4 2h1.3A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

/* ---------- posuvník (spoločný pre hlavný obrázok aj celú obrazovku) ---------- */

function useSlider(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / el.clientWidth))));
  }, [count]);

  const go = useCallback(
    (i: number, smooth = true) => {
      const el = ref.current;
      if (!el) return;
      const next = Math.max(0, Math.min(count - 1, i));
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: next * el.clientWidth, behavior: smooth && !reduce ? "smooth" : "instant" });
      setIndex(next);
    },
    [count],
  );

  return { ref, index, onScroll, go };
}

function Dots({ count, index, light }: { count: number; index: number; light?: boolean }) {
  if (count < 2) return null;
  // Ako v iOS: najviac 5 bodiek, aktívna sa posúva s nimi.
  const max = 5;
  const start = Math.max(0, Math.min(count - max, index - 2));
  const visible = Array.from({ length: Math.min(count, max) }, (_, i) => start + i);
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {visible.map((i) => (
        <span
          key={i}
          className={`rounded-full transition-all ${i === index ? "size-[7px] bg-white" : "size-1.5 bg-white/60"} ${
            light ? "" : "shadow-[0_0_2px_rgb(0_0_0/0.35)]"
          }`}
        />
      ))}
    </div>
  );
}

const roundBtn =
  "flex size-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/* ---------- hlavný obrázok ---------- */

/**
 * Hlavný obrázok detailu. So zverejnenými fotkami je to posuvník (potiahnutie prstom,
 * bodky, počítadlo, ťuknutie otvorí celú obrazovku). Bez fotiek ilustrácia + „Pridať fotku“.
 */
export function HeroGallery({
  place,
  photos,
  onOpen,
  onAdd,
}: {
  place: Place;
  photos: PlacePhoto[];
  onOpen: (index: number) => void;
  onAdd: () => void;
}) {
  const { ref, index, onScroll, go } = useSlider(photos.length);

  if (photos.length === 0) {
    return (
      <>
        <div className="aspect-[3/2] overflow-hidden sm:aspect-[16/9] sm:rounded-[28px]">
          <PlaceArt id={place.id} category={place.category} />
        </div>
        <div className="absolute inset-x-4 bottom-9 flex items-center justify-between gap-2 sm:bottom-4">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink backdrop-blur">
            {place.isDemo ? "DEMO · ilustračný obrázok" : "Ilustračný obrázok"}
          </span>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/90 px-3 text-[13px] font-semibold text-ink shadow-card backdrop-blur transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <CameraIcon size={16} />
            Pridať fotku
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="galéria"
      aria-label={`Fotky miesta, ${photosLabel(photos.length)}`}
      className="group relative"
    >
      <div
        ref={ref}
        onScroll={onScroll}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(index + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(index - 1);
          } else if (e.key === "Enter") onOpen(index);
        }}
        className="no-scrollbar flex aspect-[3/2] snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white sm:aspect-[16/9] sm:rounded-[28px]"
      >
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            tabIndex={-1}
            onClick={() => onOpen(i)}
            aria-label={`Otvoriť fotku ${i + 1} z ${photos.length} na celú obrazovku`}
            className="relative h-full w-full shrink-0 snap-center snap-always bg-cream-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- DEMO fotky sú data URL; po výbere úložiska prejdeme na next/image */}
            <img src={p.src} alt={p.alt} loading={i === 0 ? "eager" : "lazy"} draggable={false} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Ovládanie myšou (na dotykových displejoch sa posúva prstom) */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Predchádzajúca fotka"
            className={`${roundBtn} absolute left-4 top-1/2 hidden -translate-y-1/2 opacity-0 group-hover:opacity-100 disabled:!opacity-0 sm:flex`}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Ďalšia fotka"
            className={`${roundBtn} absolute right-4 top-1/2 hidden -translate-y-1/2 opacity-0 group-hover:opacity-100 disabled:!opacity-0 sm:flex`}
          >
            <Chevron dir="right" />
          </button>
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-9 flex justify-center sm:bottom-4">
        <Dots count={photos.length} index={index} />
      </div>
      <span
        aria-live="polite"
        className="pointer-events-none absolute bottom-8 right-4 rounded-full bg-ink/65 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white backdrop-blur sm:bottom-4"
      >
        {index + 1} / {photos.length}
      </span>
    </div>
  );
}

/* ---------- sekcia Fotky ---------- */

function StatusBadge({ p }: { p: PlacePhoto }) {
  if (p.status === "approved") return null;
  return (
    <span
      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${
        p.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-coral-50 text-coral-700"
      }`}
    >
      {p.status === "pending" ? "Čaká na schválenie" : "Neschválená"}
    </span>
  );
}

/**
 * Obsah sekcie „Fotky“: pás náhľadov (zverejnené + moje čakajúce) s dlaždicou „Pridať fotku“,
 * alebo prázdny stav s ilustráciou a výzvou pridať prvú fotku.
 */
export function GalleryContent({
  view,
  onOpen,
  onAdd,
}: {
  view: GalleryView;
  /** Index do zoznamu [...published, ...mineUnpublished] */
  onOpen: (index: number) => void;
  onAdd: () => void;
}) {
  const items = [...view.published, ...view.mineUnpublished];
  const canAdd = canAddPhoto(view);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-[22px] bg-white p-4 ring-1 ring-line">
        <Image src="/illustrations/dieta-lopta.png" alt="" width={681} height={674} className="h-auto w-[76px] shrink-0 select-none" />
        <div className="min-w-0">
          <p className="text-[15.5px] font-semibold text-ink">Zatiaľ tu nie sú fotky</p>
          <p className="mt-0.5 text-[14px] leading-snug text-ink-muted">Boli ste tu? Pomôžte ostatným rodičom a pridajte prvú fotku priestoru.</p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-semibold text-white transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <CameraIcon size={16} />
            Pridať prvú fotku
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0" aria-label="Fotky miesta">
        {items.map((p, i) => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[30%]">
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`Otvoriť fotku ${i + 1} z ${items.length}${statusLabel(p) ? `, ${statusLabel(p)}` : ""}`}
              className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-100 ring-1 ring-line transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- DEMO data URL */}
              <img src={p.src} alt="" loading="lazy" className={`h-full w-full object-cover ${p.status === "rejected" ? "opacity-50 grayscale" : ""}`} />
              <StatusBadge p={p} />
            </button>
          </li>
        ))}
        {canAdd && (
          <li className="w-[46%] shrink-0 snap-start sm:w-[30%]">
            <button
              type="button"
              onClick={onAdd}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-white text-[14px] font-semibold text-ink transition hover:border-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <CameraIcon size={22} />
              Pridať fotku
            </button>
          </li>
        )}
      </ul>
      {view.mineUnpublished.some((p) => p.status === "pending") && (
        <p className="mt-2.5 text-[13px] text-ink-muted">Vaše nové fotky uvidia ostatní až po schválení.</p>
      )}
      {!canAdd && (
        <p className="mt-2.5 text-[13px] text-ink-muted">
          Na schválenie čaká {MAX_PENDING_PER_PLACE} vašich fotiek. Ďalšie pridáte, keď ich skontrolujeme.
        </p>
      )}
    </>
  );
}

/* ---------- celá obrazovka ---------- */

export function Lightbox({
  photos,
  startIndex,
  open,
  onClose,
  placeName,
}: {
  photos: PlacePhoto[];
  startIndex: number;
  open: boolean;
  onClose: () => void;
  placeName: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useBackButtonClose(open, onClose);
  const { ref, index, onScroll, go } = useSlider(photos.length);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Po vykreslení skočiť na ťuknutú fotku bez animácie.
      requestAnimationFrame(() => go(startIndex, false));
    }
    if (!open && d.open) d.close();
  }, [open, startIndex, go]);

  const current = photos[index];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        else if (e.key === "ArrowLeft") go(index - 1);
      }}
      aria-label={`Fotky: ${placeName}`}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-3 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Zavrieť galériu"
              autoFocus
              className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <CloseIcon size={22} />
            </button>
            <p className="text-[15px] font-semibold tabular-nums" aria-live="polite">
              {index + 1} / {photos.length}
            </p>
            <span className="size-11" aria-hidden="true" />
          </div>

          <div className="relative min-h-0 flex-1">
            <div ref={ref} onScroll={onScroll} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
              {photos.map((p, i) => (
                <div key={p.id} className="flex h-full w-full shrink-0 snap-center snap-always items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- DEMO data URL */}
                  <img
                    src={p.src}
                    alt={`${p.alt} (${i + 1} z ${photos.length})`}
                    loading={Math.abs(i - startIndex) < 2 ? "eager" : "lazy"}
                    draggable={false}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                  aria-label="Predchádzajúca fotka"
                  className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-white sm:flex"
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  disabled={index === photos.length - 1}
                  aria-label="Ďalšia fotka"
                  className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-white sm:flex"
                >
                  <Chevron dir="right" />
                </button>
              </>
            )}
          </div>

          <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 text-center">
            {current && (
              <>
                <p className="text-[14px] font-semibold">{originLabel(current)}</p>
                <p className="mt-0.5 text-[13px] text-white/70">
                  {statusLabel(current) ?? "DEMO · uložené iba v tomto prehliadači"}
                </p>
              </>
            )}
            <div className="mt-3 flex justify-center">
              <Dots count={photos.length} index={index} light />
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

/* ---------- pridanie fotky ---------- */

export function AddPhotoDialog({
  placeId,
  placeName,
  open,
  onClose,
  onDone,
}: {
  placeId: string;
  placeName: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useBackButtonClose(open, onClose);
  const [photo, setPhoto] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const photoError = submitted && !photo ? "Vyberte fotku." : undefined;
  const consentError = submitted && photo && !consent ? "Potvrďte, prosím, že na fotke nie sú rozpoznateľné deti." : undefined;

  const reset = () => {
    setPhoto(null);
    setConsent(false);
    setSubmitted(false);
  };

  return (
    <dialog
      ref={ref}
      onClose={() => {
        reset();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="add-photo-title"
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 sm:m-auto sm:max-w-md"
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (!photo || !consent) return;
          addPhotoUpload(placeId, photo);
          reset();
          onDone();
        }}
        className="mx-auto w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-float sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="add-photo-title" className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
              Pridať fotku
            </h2>
            <p className="truncate text-[13.5px] text-ink-muted">{placeName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zavrieť" className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-cream-100">
            <CloseIcon size={20} />
          </button>
        </div>

        <ul className="mt-3 list-disc space-y-1.5 rounded-2xl bg-cream-50 py-3 pl-8 pr-4 text-[13.5px] leading-snug text-ink marker:text-turquoise-700">
          <li>Odfoťte priestor, preliezky alebo zázemie, nie deti.</li>
          <li>Fotku pred zverejnením skontrolujeme.</li>
          <li>Polohu a ďalšie údaje z fotky automaticky odstránime.</li>
        </ul>

        <div className="mt-1">
          <PhotoPicker compact value={photo} onChange={setPhoto} consent={consent} onConsent={setConsent} consentError={consentError} />
          <FieldError id="add-photo-err" message={photoError} />
        </div>

        <p className="mt-4 text-[13px] text-amber-700">DEMO: fotka sa uloží iba v tomto prehliadači a objaví sa v náhľade admin fronty na schválenie.</p>
        <button type="submit" className={`${primaryBtn} mt-4 w-full`}>
          Odoslať na schválenie
        </button>
      </form>
    </dialog>
  );
}
