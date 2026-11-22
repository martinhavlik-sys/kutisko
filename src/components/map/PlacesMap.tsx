"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker } from "maplibre-gl";
import { CATEGORIES, REFERENCE_POINT, type Place } from "@/data/places";

/**
 * Interaktívna mapa na MapLibre GL (schválené 2026-11-22).
 * Podklady: OpenFreeMap (bezplatné, bez kľúča) — poskytovateľ dlaždíc je stále otvorené rozhodnutie,
 * preto je URL štýlu na jednom mieste. Ak sa podklady nenačítajú, mapa ostane použiteľná
 * na neutrálnom pozadí s pinmi a zobrazí upozornenie.
 */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const FALLBACK_STYLE = {
  version: 8 as const,
  sources: {},
  layers: [{ id: "bg", type: "background" as const, paint: { "background-color": "#F4EEDD" } }],
};

interface Props {
  places: Place[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
  /**
   * Náhľad na Domove: mapa sa nedá posúvať ani zoomovať (nezachytáva posúvanie stránky),
   * načíta sa až keď je na obrazovke, piny ostávajú klikateľné.
   */
  preview?: boolean;
  /** Ťuk mimo pinu (v náhľade otvorí Celú mapu). */
  onBackgroundTap?: () => void;
  /** Podklady sa nenačítali — náhľad môže zobraziť vlastnú zálohu. */
  onTilesFailed?: () => void;
}

export function PlacesMap({ places, activeId, onSelect, className, preview = false, onBackgroundTap, onTilesFailed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef(new Map<string, { marker: Marker; el: HTMLButtonElement }>());
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [inView, setInView] = useState(!preview);
  const onFailRef = useRef(onTilesFailed);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onFailRef.current = onTilesFailed;
  }, [onSelect, onTilesFailed]);

  // Náhľad: knižnicu a podklady načítať až keď je mapa blízko obrazovky.
  useEffect(() => {
    if (inView) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setInView(true);
        io.disconnect();
      }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  // Inicializácia mapy (iba v prehliadači).
  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    let map: MlMap | null = null;
    import("maplibre-gl").then((ml) => {
      if (cancelled || !containerRef.current) return;
      ml.setWorkerUrl(`/vendor/maplibre-gl-worker.mjs?v=${ml.getVersion()}`);
      map = new ml.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [REFERENCE_POINT.lng, REFERENCE_POINT.lat],
        zoom: 10.3,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        cooperativeGestures: false,
        interactive: !preview,
      });
      if (!preview) {
        map.touchZoomRotate.disableRotation();
        map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
      }
      let loaded = false;
      map.on("load", () => {
        loaded = true;
        if (!cancelled) setReady(true);
      });
      map.on("error", () => {
        if (loaded || cancelled) return;
        loaded = true;
        setTilesFailed(true);
        onFailRef.current?.();
        map?.setStyle(FALLBACK_STYLE);
        setReady(true);
      });
      map.on("click", (e) => {
        const target = e.originalEvent.target as HTMLElement;
        if (!target.closest("[data-pin]")) onSelectRef.current(null);
      });
      mapRef.current = map;
      // Bezpečnostná poistka: ak sa štýl nenačíta do 8 s (napr. blokovaná sieť).
      window.setTimeout(() => {
        if (!loaded && !cancelled) {
          loaded = true;
          setTilesFailed(true);
          onFailRef.current?.();
          map?.setStyle(FALLBACK_STYLE);
          setReady(true);
        }
      }, 8000);
    });
    const markers = markersRef.current;
    return () => {
      cancelled = true;
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      map?.remove();
      mapRef.current = null;
    };
  }, [inView, preview]);

  // Synchronizácia pinov s výsledkami.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let alive = true;
    import("maplibre-gl").then((ml) => {
      if (!alive) return;
      const markers = markersRef.current;
      const ids = new Set(places.map((p) => p.id));
      markers.forEach((m, id) => {
        if (!ids.has(id)) {
          m.marker.remove();
          markers.delete(id);
        }
      });
      for (const p of places) {
        if (markers.has(p.id)) continue;
        const cat = CATEGORIES.find((c) => c.id === p.category)!;
        const el = document.createElement("button");
        el.type = "button";
        el.dataset.pin = p.id;
        el.className = "kut-pin";
        el.setAttribute("aria-label", `${p.name}, ${cat.shortLabel.toLowerCase()}, ${p.area}`);
        el.innerHTML = `<span class="kut-pin-dot"></span>`;
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          onSelectRef.current(p.id);
        });
        const marker = new ml.Marker({ element: el, anchor: "center" }).setLngLat([p.lng, p.lat]).addTo(map);
        markers.set(p.id, { marker, el });
      }
      if (places.length > 0) {
        const b = new ml.LngLatBounds();
        places.forEach((p) => b.extend([p.lng, p.lat]));
        const padding = preview ? { top: 64, bottom: 36, left: 32, right: 32 } : { top: 70, bottom: 170, left: 50, right: 50 };
        map.fitBounds(b, { padding, maxZoom: preview ? 12.5 : 13.5, duration: preview ? 0 : 450 });
      }
    });
    return () => {
      alive = false;
    };
  }, [places, ready, preview]);

  // Zvýraznenie aktívneho pinu.
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      const active = id === activeId;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", String(active));
      el.style.zIndex = active ? "2" : "1";
    });
    const map = mapRef.current;
    const p = places.find((x) => x.id === activeId);
    if (map && p && ready && !preview) map.easeTo({ center: [p.lng, p.lat], duration: 350, offset: [0, -60] });
  }, [activeId, places, ready, preview]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Mapa miest"
        role="region"
        onClick={
          onBackgroundTap
            ? (e) => {
                if (!(e.target as HTMLElement).closest("[data-pin], a, button")) onBackgroundTap();
              }
            : undefined
        }
      />
      {!ready && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      {tilesFailed && !preview && (
        <p role="status" className="absolute left-3 right-14 top-3 rounded-2xl bg-white/95 px-3 py-2 text-[13px] leading-snug text-ink-muted shadow-card">
          Mapové podklady sa nepodarilo načítať. Piny miest fungujú, skúste to neskôr znova.
        </p>
      )}
    </div>
  );
}
