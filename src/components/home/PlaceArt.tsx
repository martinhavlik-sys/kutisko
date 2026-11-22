import type { CategoryId } from "@/data/places";

/**
 * Abstraktný ilustračný náhľad namiesto fotografie (prototyp nemá licencované fotky
 * a nesmie používať fotografie detí). Variácie sú deterministické podľa id miesta.
 */
const PALETTES: Record<CategoryId, { bg: string; a: string; b: string; c: string }> = {
  kutik: { bg: "#FBE9E3", a: "#FF8FA1", b: "#F5C76A", c: "#FFFFFF" },
  herna: { bg: "#FFF0CF", a: "#F5AD1D", b: "#FF7088", c: "#FFFFFF" },
  ihrisko: { bg: "#DDF1F4", a: "#7FD0DF", b: "#B9D9A4", c: "#FFFFFF" },
};

function seed(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function PlaceArt({ id, category }: { id: string; category: CategoryId }) {
  const p = PALETTES[category];
  const s = seed(id);
  const r = (n: number, min: number, max: number) => min + ((s >> n) % 1000) / 1000 * (max - min);
  const flip = s % 2 === 0;

  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="400" height="250" fill={p.bg} />
      <g transform={flip ? "translate(400 0) scale(-1 1)" : undefined}>
        <circle cx={r(1, 260, 330)} cy={r(3, 50, 90)} r={r(5, 34, 48)} fill={p.b} opacity="0.9" />
        {category === "ihrisko" ? (
          <>
            <path d={`M0 ${r(2, 170, 190)} C 120 ${r(4, 130, 160)}, 240 210, 400 ${r(6, 160, 185)} V250 H0Z`} fill={p.b} opacity="0.75" />
            <path d={`M0 215 C 140 190, 260 235, 400 205 V250 H0Z`} fill={p.a} opacity="0.55" />
            <g stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.95">
              <path d="M110 205 L140 95 L200 95 L230 205" />
              <path d="M170 95 v62" strokeWidth="4" />
              <path d="M155 160 h30" />
            </g>
          </>
        ) : category === "herna" ? (
          <>
            <rect x="0" y="190" width="400" height="60" fill={p.a} opacity="0.35" />
            <path d="M70 200 C 120 200, 150 120, 210 110 L 240 110" stroke={p.b} strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.85" />
            <rect x="235" y="80" width="70" height="120" rx="14" fill={p.c} opacity="0.9" />
            <circle cx={r(7, 90, 140)} cy="70" r="16" fill={p.a} opacity="0.8" />
            <circle cx={r(9, 320, 360)} cy="190" r="22" fill={p.b} opacity="0.5" />
          </>
        ) : (
          <>
            <rect x="0" y="185" width="400" height="65" fill={p.a} opacity="0.3" />
            <rect x="80" y="135" width="52" height="52" rx="10" fill={p.a} opacity="0.85" />
            <rect x="140" y="150" width="38" height="38" rx="8" fill={p.b} />
            <rect x="96" y="96" width="38" height="38" rx="8" fill={p.c} />
            <path d="M250 190 v-60 a30 30 0 0 1 60 0 v60" fill={p.c} opacity="0.85" />
            <circle cx={r(8, 40, 70)} cy="60" r="12" fill={p.a} opacity="0.6" />
          </>
        )}
      </g>
    </svg>
  );
}
