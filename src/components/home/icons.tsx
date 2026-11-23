import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);
export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
);
export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);
export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.6 3.7 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.3 0 5.3 3.1 4.2 6.2C19.5 15.4 12 20 12 20Z" />
  </Base>
);
export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" />
  </Base>
);
export const UserIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </Base>
);
export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Base>
);
export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);
export const MapIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
    <path d="M9 4v14M15 6v14" />
  </Base>
);
export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);
export const StarIcon = (p: IconProps) => (
  <Base {...p} fill="currentColor" stroke="none">
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8L12 3.5Z" />
  </Base>
);
export const CheckBadgeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.2 14.3 5l2.9-.2.9 2.8 2.4 1.7-1 2.7 1 2.7-2.4 1.7-.9 2.8-2.9-.2L12 20.8 9.7 19l-2.9.2-.9-2.8-2.4-1.7 1-2.7-1-2.7 2.4-1.7.9-2.8 2.9.2L12 3.2Z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </Base>
);
export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4 2.8 19.5h18.4L12 4Z" />
    <path d="M12 10v4.2M12 17h.01" />
  </Base>
);
export const RefreshIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.6l1.7-2.1M20 20v-4.5h-4.5" />
  </Base>
);
export const SlidersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Base>
);

/* Ikony kategórií — jednoduché, priateľské, bez detskej „kreslenosti“. */
export const CategoryAllIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
  </Base>
);
export const CategoryKutikIcon = (p: IconProps) => (
  <Base {...p}>
    {/* šálka + kocka: kaviareň s kútikom */}
    <path d="M3.5 11h9v4.5a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4V11Z" />
    <path d="M12.5 12.5h1.2a2 2 0 0 1 0 4h-1.5" />
    <rect x="15" y="4" width="5.5" height="5.5" rx="1.3" />
    <path d="M6.5 8c0-1 1-1.3 1-2.3M9.5 8c0-1 1-1.3 1-2.3" />
  </Base>
);
export const CategoryHernaIcon = (p: IconProps) => (
  <Base {...p}>
    {/* šmykľavka v interiéri */}
    <path d="M3 20V9l9-5 9 5v11" />
    <path d="M8 20v-7h2.5l5 7" />
    <path d="M8 16h3" />
  </Base>
);
export const CategoryIhriskoIcon = (p: IconProps) => (
  <Base {...p}>
    {/* strom + hojdačka */}
    <circle cx="7" cy="8" r="3.5" />
    <path d="M7 11.5V20" />
    <path d="M12.5 20 15 6h4l2.5 14" />
    <path d="M17 6v8M15.5 14h3" />
  </Base>
);
/** Navigačná šípka — „Moja poloha“. */
export const LocateIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20.5 3.5 3.5 10.6l7.2 2.7 2.7 7.2 7.1-17Z" />
  </Base>
);
