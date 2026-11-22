"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/lib/saved";
import { HeartIcon, HomeIcon, SearchIcon, UserIcon } from "@/components/home/icons";

const TABS = [
  { href: "/", label: "Domov", Icon: HomeIcon },
  { href: "/hladat", label: "Hľadať", Icon: SearchIcon },
  { href: "/ulozene", label: "Obľúbené", Icon: HeartIcon },
  { href: "/profil", label: "Profil", Icon: UserIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const saved = useSaved();

  return (
    <nav
      aria-label="Hlavná navigácia"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
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
