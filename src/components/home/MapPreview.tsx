"use client";

import { useState } from "react";
import { CATEGORIES, REFERENCE_POINT, type Place } from "@/data/places";
import { PlacesMap } from "@/components/map/PlacesMap";
import { MapIcon } from "./icons";

/**
 * Ilustračná záloha náhľadu mapy (keď sa podklady MapLibre nenačítajú).
 * Piny sú premietnuté z GPS súradníc DEMO miest jednoduchou lineárnou projekciou,
 * takže sa synchronizujú s filtrami a zoznamom.
 */
const W = 360;
const H = 260;
const BOUNDS = { west: 16.92, east: 17.48, south: 48.016, north: 48.287 };

function project(lat: number, lng: number) {
  return {
    x: ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * W,
    y: ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * H,
  };
}

function path(points: [number, number][]) {
  return points
    .map(([lat, lng], i) => {
      const { x, y } = project(lat, lng);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const DANUBE = path([
  [48.205, 16.92],
  [48.175, 16.975],
  [48.162, 17.02],
  [48.143, 17.07],
  [48.139, 17.105],
  [48.13, 17.15],
  [48.115, 17.19],
  [48.09, 17.225],
  [48.06, 17.27],
  [48.03, 17.31],
  [48.005, 17.36],
]);
const MORAVA = path([
  [48.287, 16.94],
  [48.24, 16.955],
  [48.2, 16.965],
  [48.175, 16.975],
]);
const D1 = path([
  [48.15, 17.14],
  [48.17, 17.22],
  [48.19, 17.3],
  [48.215, 17.39],
  [48.23, 17.48],
]);
const D2 = path([
  [48.14, 17.09],
  [48.18, 17.07],
  [48.23, 17.05],
  [48.287, 17.03],
]);
const D4 = path([
  [48.287, 17.11],
  [48.22, 17.18],
  [48.16, 17.19],
  [48.1, 17.15],
  [48.06, 17.1],
  [48.016, 17.06],
]);
const SAMORIN_ROAD = path([
  [48.11, 17.13],
  [48.07, 17.22],
  [48.03, 17.3],
]);

const LABELS: { name: string; lat: number; lng: number }[] = [
  { name: "Bratislava", lat: 48.168, lng: 17.185 },
  { name: "Senec", lat: 48.232, lng: 17.385 },
  { name: "Stupava", lat: 48.262, lng: 17.05 },
  { name: "Šamorín", lat: 48.041, lng: 17.328 },
];

const lake = project(48.214, 17.392);
const parkA = project(48.112, 17.1);
const center = project(REFERENCE_POINT.lat, REFERENCE_POINT.lng);

interface Props {
  places: Place[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onOpenMap?: () => void;
  label?: string;
  loading?: boolean;
  me?: { lat: number; lng: number } | null;
}

/** Ilustračná mapa — záloha, keď sa skutočné podklady nenačítajú. */
function IllustratedMap({ places, activeId, onSelect, onOpenMap, loading, me, label = "Náhľad mapy" }: Props) {
  const meXY = me ? project(me.lat, me.lng) : null;
  return (
    <section aria-label={label} className="relative overflow-hidden rounded-[28px] bg-cream-100 shadow-card ring-1 ring-line">
      <div className="relative aspect-[360/260] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <rect width={W} height={H} fill="#F4EEDD" />
          {/* Malé Karpaty */}
          <path d="M0 0 H158 C150 34 128 62 104 88 C 84 110 58 118 34 136 C 20 146 8 150 0 152 Z" fill="var(--color-leaf-100)" />
          <ellipse cx={parkA.x} cy={parkA.y + 8} rx="26" ry="12" fill="var(--color-leaf-100)" />
          <ellipse cx="265" cy="200" rx="40" ry="18" fill="var(--color-leaf-100)" opacity="0.8" />
          {/* cesty */}
          <g fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
            <path d={D1} strokeWidth="4" />
            <path d={D2} strokeWidth="4" />
            <path d={D4} strokeWidth="3" />
            <path d={SAMORIN_ROAD} strokeWidth="3" />
          </g>
          <g fill="none" stroke="#E9DFC6" strokeLinecap="round" strokeWidth="1">
            <path d={D1} />
            <path d={D2} />
          </g>
          {/* rieky */}
          <path d={DANUBE} fill="none" stroke="var(--color-turquoise-400)" strokeOpacity="0.55" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d={MORAVA} fill="none" stroke="var(--color-turquoise-400)" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx={lake.x} cy={lake.y} rx="9" ry="5" fill="var(--color-turquoise-400)" fillOpacity="0.5" />
          {/* názvy */}
          {LABELS.map((l) => {
            const p = project(l.lat, l.lng);
            return (
              <text
                key={l.name}
                x={p.x}
                y={p.y}
                fontSize={l.name === "Bratislava" ? 11 : 9}
                fontWeight={l.name === "Bratislava" ? 600 : 500}
                fill="#7d7468"
                style={{ letterSpacing: "0.02em" }}
              >
                {l.name}
              </text>
            );
          })}
          {/* referenčný bod alebo poloha rodiča */}
          {meXY ? (
            <g aria-label="Vaša poloha">
              <circle cx={meXY.x} cy={meXY.y} r="12" fill="#2563eb" fillOpacity="0.18" />
              <circle cx={meXY.x} cy={meXY.y} r="5.5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
            </g>
          ) : (
            <>
              <circle cx={center.x} cy={center.y} r="10" fill="var(--color-turquoise-400)" fillOpacity="0.18" />
              <circle cx={center.x} cy={center.y} r="4" fill="#fff" stroke="var(--color-turquoise-700)" strokeWidth="2" />
            </>
          )}
        </svg>

        {!loading &&
          places.map((p) => {
            const { x, y } = project(p.lat, p.lng);
            const active = p.id === activeId;
            const cat = CATEGORIES.find((c) => c.id === p.category)!;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                aria-label={`${p.name}, ${cat.shortLabel.toLowerCase()}, ${p.area}`}
                aria-pressed={active}
                className="group absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink"
                style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, zIndex: active ? 20 : 10 }}
              >
                <span
                  className={`block rounded-full border-[2.5px] border-white shadow-[0_2px_6px_rgb(31_26_22/0.25)] transition-all duration-200 ${
                    active ? "size-[22px] bg-ink" : "size-4 bg-coral-500 group-hover:scale-110"
                  }`}
                />
              </button>
            );
          })}

        {loading && <div className="skeleton absolute inset-0 opacity-60" aria-hidden="true" />}

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-muted backdrop-blur">
          Ilustračná mapa (podklady nedostupné) · DEMO
        </span>

        {onOpenMap && (
        <button
          type="button"
          onClick={onOpenMap}
          className="absolute right-3 top-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-float transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <MapIcon size={18} />
          Celá mapa
        </button>
        )}
      </div>
    </section>
  );
}

/**
 * Náhľad mapy na Domove: skutočná mapa MapLibre (rovnaké podklady ako Celá mapa),
 * bez posúvania a zoomu, aby nezachytávala posúvanie stránky. Ťuk na pin zvýrazní kartu,
 * ťuk inde alebo „Celá mapa“ otvorí plnú mapu. Pri chybe podkladov sa ukáže ilustračná mapa.
 */
export function MapPreview(props: Props) {
  const { places, activeId, onSelect, onOpenMap, loading, me, label = "Náhľad mapy" } = props;
  const [failed, setFailed] = useState(false);
  if (failed) return <IllustratedMap {...props} />;

  return (
    <section aria-label={label} className="relative overflow-hidden rounded-[28px] bg-cream-100 shadow-card ring-1 ring-line">
      <div className="relative aspect-[360/260] w-full">
        <PlacesMap
          preview
          places={loading ? [] : places}
          activeId={activeId}
          onSelect={(id) => id && onSelect(id)}
          onBackgroundTap={onOpenMap}
          onTilesFailed={() => setFailed(true)}
          me={me}
          className="h-full w-full cursor-pointer"
        />
        {loading && <div className="skeleton pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />}
        {onOpenMap && (
          <button
            type="button"
            onClick={onOpenMap}
            className="absolute right-3 top-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-float transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <MapIcon size={18} />
            Celá mapa
          </button>
        )}
      </div>
    </section>
  );
}
