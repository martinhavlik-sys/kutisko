"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSaved } from "@/lib/saved";
import { HeartIcon, HomeIcon, SearchIcon, UserIcon } from "@/components/home/icons";

const TABS = [
  { href: "/", label: "Domov", Icon: HomeIcon },
  { href: "/hladat", label: "Hľadať", Icon: SearchIcon },
  { href: "/ulozene", label: "Obľúbené", Icon: HeartIcon },
  { href: "/profil", label: "Profil", Icon: UserIcon },
] as const;

/** Po koľkých pixeloch posunu nadol sa menu schová / pri koľkých nahor sa ukáže. */
const HIDE_AFTER = 80;
const DOWN_DELTA = 12;
const UP_DELTA = 6;

/**
 * Menu sa pri čítaní (posun nadol) schová, aby nezakrývalo obsah, a vráti sa
 * pri posune nahor, pri vrchu aj na konci stránky. `autoHide={false}` ho
 * nechá stále viditeľné (napr. mapa bez posúvania).
 */
function useAutoHide(enabled: boolean) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let last = window.scrollY;
    let anchor = last;
    let dir = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - last;
      if (delta === 0) return;
      const nextDir = delta > 0 ? 1 : -1;
      if (nextDir !== dir) {
        dir = nextDir;
        anchor = last;
      }
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 24;
      if (y < HIDE_AFTER || atBottom) setHidden(false);
      else if (dir > 0 && y - anchor > DOWN_DELTA) setHidden(true);
      else if (dir < 0 && anchor - y > UP_DELTA) setHidden(false);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      setHidden(false);
    };
  }, [enabled]);

  return [enabled && hidden, setHidden] as const;
}

export function BottomNav({ autoHide = true }: { autoHide?: boolean }) {
  const pathname = usePathname();
  const saved = useSaved();
  const [hidden, setHidden] = useAutoHide(autoHide);

  return (
    <nav
      aria-label="Hlavná navigácia"
      data-hidden={hidden || undefined}
      onFocus={() => setHidden(false)}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform data-hidden:translate-y-full motion-reduce:transition-none"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[58px] w-full flex-col items-center justify-center gap-1 text-[11.5px] font-medium transition focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink ${
                  active ? "text-coral-600" : "text-ink-muted hover:text-ink"
                }`}
              >
                <span className="relative">
                  <Icon size={24} strokeWidth={active ? 2.1 : 1.7} />
                  {href === "/ulozene" && saved.ids.length > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-600 px-1 text-[10px] font-bold text-white">
                      {saved.ids.length}
                      <span className="sr-only"> uložených</span>
                    </span>
                  )}
                </span>
                {label}
                {active && <span aria-hidden="true" className="absolute top-0 h-[3px] w-8 rounded-b-full bg-amber-400" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
