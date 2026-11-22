"use client";

import { HeartIcon, HomeIcon, SearchIcon, UserIcon } from "./icons";

type TabId = "home" | "search" | "saved" | "profile";

const TABS: { id: TabId; label: string; Icon: typeof HomeIcon }[] = [
  { id: "home", label: "Domov", Icon: HomeIcon },
  { id: "search", label: "Hľadať", Icon: SearchIcon },
  { id: "saved", label: "Obľúbené", Icon: HeartIcon },
  { id: "profile", label: "Profil", Icon: UserIcon },
];

export function BottomNav({ savedCount, onSelect }: { savedCount: number; onSelect: (id: TabId) => void }) {
  return (
    <nav
      aria-label="Hlavná navigácia"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {TABS.map(({ id, label, Icon }) => {
          const active = id === "home";
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[58px] w-full flex-col items-center justify-center gap-1 text-[11.5px] font-medium transition focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink ${
                  active ? "text-coral-600" : "text-ink-muted hover:text-ink"
                }`}
              >
                <span className="relative">
                  <Icon size={24} strokeWidth={active ? 2.1 : 1.7} />
                  {id === "saved" && savedCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-600 px-1 text-[10px] font-bold text-white">
                      {savedCount}
                      <span className="sr-only"> uložených</span>
                    </span>
                  )}
                </span>
                {label}
                {active && <span aria-hidden="true" className="absolute top-0 h-[3px] w-8 rounded-b-full bg-amber-400" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
