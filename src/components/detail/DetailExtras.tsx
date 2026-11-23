"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Place } from "@/data/places";
import { addTip, useTips } from "@/lib/community";
import { bratislavaTime, openStatus, parseOsmHours, parseWeek, type OpenStatus } from "@/lib/openingHours";
import { formatDate } from "@/lib/search";
import { FieldError } from "@/components/forms/FormParts";

/* ---------- čas a stav otvorenia ---------- */

const minuteListeners = new Set<() => void>();
let minuteTimer: ReturnType<typeof setInterval> | null = null;
let nowCache = 0;
function subscribeMinute(cb: () => void) {
  minuteListeners.add(cb);
  if (!minuteTimer) {
    minuteTimer = setInterval(() => {
      nowCache = Math.floor(Date.now() / 60000);
      minuteListeners.forEach((l) => l());
    }, 15000);
  }
  return () => {
    minuteListeners.delete(cb);
    if (minuteListeners.size === 0 && minuteTimer) {
      clearInterval(minuteTimer);
      minuteTimer = null;
    }
  };
}

/** Aktuálna minúta; na serveri null (stav otvorenia sa ukáže až v prehliadači, bez nesúladu pri hydratácii). */
function useMinute(): number | null {
  return useSyncExternalStore(
    subscribeMinute,
    () => nowCache || (nowCache = Math.floor(Date.now() / 60000)),
    () => null,
  );
}

export function useOpenStatus(place: Place): { status: OpenStatus | null; day: number | null } {
  const minute = useMinute();
  const week = useMemo(
    () => (place.web ? parseWeek(place.web.hoursWeek) : parseOsmHours(place.openingHours)),
    [place.web, place.openingHours],
  );
  return useMemo(() => {
    if (minute === null) return { status: null, day: null };
    const now = bratislavaTime(new Date(minute * 60000));
    return { status: openStatus(week, now), day: now.day };
  }, [minute, week]);
}

const statusTone = {
  open: "bg-turquoise-50 text-turquoise-700 ring-turquoise-400/40",
  closing: "bg-amber-50 text-amber-700 ring-amber-400/40",
  closed: "bg-coral-50 text-coral-700 ring-coral-500/30",
} as const;

export function OpenStatusPill({ status }: { status: OpenStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${statusTone[status.state]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      <span>
        <span className="font-semibold">{status.label}</span>
        {status.detail && <span className="font-medium"> · {status.detail}</span>}
      </span>
    </span>
  );
}

/* ---------- rýchle akcie ---------- */

function Icon({ d, fill }: { d: string; fill?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  route: "M20.6 3.4a1 1 0 0 0-1.1-.2L3.7 9.8a1 1 0 0 0 .1 1.9l6.7 1.8 1.8 6.7a1 1 0 0 0 1.9.1l6.6-15.8a1 1 0 0 0-.2-1.1Z",
  phone:
    "M5 4h3l1.5 4.5-2 1.3a11 11 0 0 0 6.7 6.7l1.3-2L20 16v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  web: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  share: "M12 3v12M7.5 7.5 12 3l4.5 4.5M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1",
};

const actionCls =
  "flex min-h-[68px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-1 text-[12.5px] font-semibold text-ink ring-1 ring-line transition hover:ring-ink-subtle active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Zdieľanie cez systémový panel (iPhone: Správy, WhatsApp…), inak skopíruje odkaz. */
export async function sharePlace(place: Place): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  const url = window.location.href.split("#")[0];
  const data = { title: `${place.name} — KUTISKO`, text: `${place.name} (${place.area}) na KUTISKO`, url };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function QuickActions({ place, onRoute, onShare }: { place: Place; onRoute: () => void; onShare: () => void }) {
  const phone = place.web?.contact?.phone;
  return (
    <div className="mt-4 flex gap-2">
      <button type="button" onClick={onRoute} className={actionCls}>
        <span className="text-coral-600">
          <Icon d={ICONS.route} fill />
        </span>
        Trasa
      </button>
      {phone && (
        <a href={telHref(phone)} className={actionCls} aria-label={`Zavolať: ${phone}`}>
          <span className="text-turquoise-700">
            <Icon d={ICONS.phone} />
          </span>
          Zavolať
        </a>
      )}
      {place.web && (
        <a href={place.web.website} target="_blank" rel="noopener noreferrer" className={actionCls}>
          <span className="text-turquoise-700">
            <Icon d={ICONS.web} />
          </span>
          Web<span className="sr-only"> prevádzky (otvorí sa v novom okne)</span>
        </a>
      )}
      <button type="button" onClick={onShare} className={actionCls}>
        <span className="text-turquoise-700">
          <Icon d={ICONS.share} />
        </span>
        Zdieľať
      </button>
    </div>
  );
}

/* ---------- tipy od rodičov ---------- */

export const TIP_MIN = 10;
export const TIP_MAX = 160;

export function ParentTips({ placeId, onAdded }: { placeId: string; onAdded: () => void }) {
  const [tips] = useTips();
  const mine = tips.filter((t) => t.placeId === placeId);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | undefined>();

  return (
    <div>
      {mine.length > 0 ? (
        <ul className="space-y-2.5">
          {mine.map((t) => (
            <li key={t.id} className="rounded-[22px] bg-white p-4 ring-1 ring-line">
              <p className="text-[15px] leading-relaxed text-ink">{t.text}</p>
              <p className="mt-1.5 text-[12.5px] text-ink-muted">
                Váš tip · {formatDate(t.createdAt.slice(0, 10))} · DEMO, iba v tomto prehliadači
              </p>
            </li>
          ))}
        </ul>
      ) : (
        !open && (
          <p className="text-[15px] leading-relaxed text-ink-muted">
            Zatiaľ tu nie sú žiadne tipy. Poraďte ostatným rodičom, napríklad kde zaparkovať, či je tam tieň alebo čo si vziať so sebou.
          </p>
        )
      )}

      {open ? (
        <form
          noValidate
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const v = text.trim();
            if (v.length < TIP_MIN) {
              setError(`Napíšte aspoň ${TIP_MIN} znakov.`);
              return;
            }
            addTip(placeId, v);
            setText("");
            setError(undefined);
            setOpen(false);
            onAdded();
          }}
        >
          <label htmlFor="tip-text" className="block text-[14px] font-semibold text-ink">
            Váš tip
          </label>
          <textarea
            id="tip-text"
            rows={3}
            maxLength={TIP_MAX}
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "tip-err" : "tip-count"}
            placeholder="Napr. parkovanie je zadarmo za budovou, vezmite deťom ponožky."
            className="mt-1.5 w-full rounded-2xl bg-white px-4 py-3 text-[16px] text-ink ring-1 ring-line placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-ink"
          />
          <div className="flex items-start justify-between gap-3">
            <FieldError id="tip-err" message={error} />
            <p id="tip-count" className="ml-auto mt-1 text-[12.5px] text-ink-muted">
              {text.length} / {TIP_MAX}
            </p>
          </div>
          <p className="mt-1 text-[12.5px] text-ink-muted">Bez mien a údajov o deťoch. DEMO: tip sa uloží iba v tomto prehliadači.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[14px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Pridať tip
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(undefined);
              }}
              className="inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-semibold text-ink-muted hover:text-ink"
            >
              Zrušiť
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-white px-4 text-[14px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          + Pridať tip
        </button>
      )}
    </div>
  );
}

/* ---------- narodeninové oslavy ---------- */

/**
 * Len to, čo vieme z webu prevádzky: či oslavy uvádza (vybavenie „oslavy“) a kontakt.
 * Ceny ani balíčky nevymýšľame.
 */
export function BirthdayInfo({ place }: { place: Place }) {
  const offers = place.amenities.includes("oslavy");
  const contact = place.web?.contact;
  const phone = contact?.partyPhone ?? contact?.phone;
  return (
    <div className="rounded-[22px] bg-white p-4 ring-1 ring-line">
      <p className="text-[15px] leading-relaxed text-ink">
        {offers
          ? "Podľa webu prevádzky tu organizujú detské oslavy. Balíčky, ceny a voľné termíny si overte priamo u prevádzky."
          : "Zatiaľ nevieme, či tu organizujú oslavy. Ak áno, radi to doplníme."}
      </p>
      {(phone || place.web) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {phone && (
            <a
              href={telHref(phone)}
              className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-[14px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Zavolať{contact?.partyPhone ? " kvôli oslave" : ""} · {phone}
            </a>
          )}
          {place.web && (
            <a
              href={place.web.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-[14px] font-semibold text-ink ring-1 ring-line hover:ring-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Web prevádzky<span className="sr-only"> (otvorí sa v novom okne)</span>
            </a>
          )}
        </div>
      )}
      {contact && (
        <p className="mt-2.5 text-[12.5px] text-ink-muted">Telefón z webu prevádzky, overené {formatDate(contact.checkedAt)}.</p>
      )}
    </div>
  );
}
