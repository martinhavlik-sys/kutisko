"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES, PLACES } from "@/data/places";
import {
  addAudit,
  resetAdminSeed,
  resetCommunityDemo,
  seedAdminDemo,
  useAudit,
  useMyReviews,
  useReports,
  useSuggestions,
  type ModerationStatus,
} from "@/lib/community";
import { FormHeader } from "@/components/forms/FormParts";
import { StarIcon } from "@/components/home/icons";

type Tab = "suggestions" | "photos" | "reports" | "reviews";

const placeName = (id: string) => PLACES.find((p) => p.id === id)?.name ?? "Neznáme miesto";
const fmt = (iso: string) =>
  new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function StatusPill({ status }: { status: ModerationStatus | "open" | "resolved" | "visible" | "hidden" }) {
  const map = {
    pending: ["Čaká", "bg-amber-50 text-amber-700"],
    open: ["Otvorené", "bg-amber-50 text-amber-700"],
    approved: ["Schválené", "bg-turquoise-50 text-turquoise-700"],
    resolved: ["Vyriešené", "bg-turquoise-50 text-turquoise-700"],
    visible: ["Zverejnené", "bg-turquoise-50 text-turquoise-700"],
    rejected: ["Zamietnuté", "bg-coral-50 text-coral-700"],
    hidden: ["Skryté", "bg-coral-50 text-coral-700"],
  } as const;
  const [label, cls] = map[status];
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{label}</span>;
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
}

function ActionBtn({ onClick, kind, children }: { onClick: () => void; kind: "approve" | "reject" | "neutral"; children: React.ReactNode }) {
  const cls =
    kind === "approve"
      ? "bg-ink text-white"
      : kind === "reject"
        ? "bg-white text-coral-600 ring-1 ring-line hover:ring-coral-600"
        : "bg-white text-ink ring-1 ring-line hover:ring-ink-subtle";
  return (
    <button type="button" onClick={onClick} className={`min-h-10 rounded-full px-4 text-[14px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${cls}`}>
      {children}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <li className="rounded-[22px] bg-white p-4 ring-1 ring-line">{children}</li>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-[22px] bg-white px-4 py-8 text-center text-[15px] text-ink-muted ring-1 ring-line">{text}</p>;
}

export function AdminScreen() {
  const [tab, setTab] = useState<Tab>("suggestions");
  const [suggestions, setSuggestions] = useSuggestions();
  const [reports, setReports] = useReports();
  const [reviews, setReviews] = useMyReviews();
  const [audit] = useAudit();

  useEffect(() => {
    seedAdminDemo();
  }, []);

  const photos = [
    ...suggestions.filter((s) => s.photo).map((s) => ({ key: `s:${s.id}`, title: s.name, src: s.photo!.dataUrl, status: s.photo!.status, source: "Návrh miesta" })),
    ...reviews.filter((r) => r.photo).map((r) => ({ key: `r:${r.id}`, title: placeName(r.placeId), src: r.photo!.dataUrl, status: r.photo!.status, source: "Hodnotenie" })),
  ];

  const setPhotoStatus = (key: string, status: ModerationStatus) => {
    const [kind, id] = key.split(":");
    if (kind === "s") setSuggestions((all) => all.map((s) => (s.id === id && s.photo ? { ...s, photo: { ...s.photo, status } } : s)));
    else setReviews((all) => all.map((r) => (r.id === id && r.photo ? { ...r, photo: { ...r.photo, status } } : r)));
  };

  const counts: Record<Tab, number> = {
    suggestions: suggestions.filter((s) => s.status === "pending").length,
    photos: photos.filter((p) => p.status === "pending").length,
    reports: reports.filter((r) => r.status === "open").length,
    reviews: reviews.length,
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "suggestions", label: "Návrhy" },
    { id: "photos", label: "Fotky" },
    { id: "reports", label: "Nahlásenia" },
    { id: "reviews", label: "Recenzie" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
      <FormHeader title="Admin fronta" subtitle="Náhľad · DEMO · bez oprávnení" />

      <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-[13.5px] leading-relaxed text-amber-700">
        Toto je iba náhľad pre testovanie. V produkcii bude fronta dostupná len administrátorom a každý zásah sa bude evidovať na serveri.
        Tu sa zmeny ukladajú iba v tomto prehliadači.
      </p>

      <div role="tablist" aria-label="Typ položiek" className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              tab === t.id ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line"
            }`}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span className={`rounded-full px-1.5 text-[12px] ${tab === t.id ? "bg-white/20" : "bg-cream-100"}`}>{counts[t.id]}</span>
            )}
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-4">
        {tab === "suggestions" &&
          (suggestions.length === 0 ? (
            <Empty text="Žiadne návrhy miest." />
          ) : (
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <Card key={s.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold text-ink">{s.name}</p>
                      <p className="text-[13.5px] text-ink-muted">
                        {CATEGORIES.find((c) => c.id === s.category)?.label} · {s.area}
                        {s.ageMin !== null || s.ageMax !== null ? ` · vek ${s.ageMin ?? "?"}–${s.ageMax ?? "?"}` : ""}
                      </p>
                      <p className="text-[12.5px] text-ink-muted">
                        {fmt(s.createdAt)} · {s.mine ? "váš návrh" : "ukážkový návrh"}
                        {s.photo ? " · s fotkou" : ""}
                      </p>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                  {s.description && <p className="mt-2 text-[14.5px] leading-relaxed text-ink">{s.description}</p>}
                  <Actions>
                    {s.status === "pending" ? (
                      <>
                        <ActionBtn
                          kind="approve"
                          onClick={() => {
                            setSuggestions((all) => all.map((x) => (x.id === s.id ? { ...x, status: "approved" } : x)));
                            addAudit(`Schválený návrh „${s.name}“`);
                          }}
                        >
                          Schváliť
                        </ActionBtn>
                        <ActionBtn
                          kind="reject"
                          onClick={() => {
                            setSuggestions((all) => all.map((x) => (x.id === s.id ? { ...x, status: "rejected" } : x)));
                            addAudit(`Zamietnutý návrh „${s.name}“`);
                          }}
                        >
                          Zamietnuť
                        </ActionBtn>
                      </>
                    ) : (
                      <ActionBtn
                        kind="neutral"
                        onClick={() => {
                          setSuggestions((all) => all.map((x) => (x.id === s.id ? { ...x, status: "pending" } : x)));
                          addAudit(`Návrh „${s.name}“ vrátený do fronty`);
                        }}
                      >
                        Vrátiť do fronty
                      </ActionBtn>
                    )}
                  </Actions>
                </Card>
              ))}
            </ul>
          ))}

        {tab === "photos" &&
          (photos.length === 0 ? (
            <Empty text="Žiadne fotky na kontrolu. Fotku pridáte pri hodnotení alebo návrhu miesta." />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {photos.map((p) => (
                <Card key={p.key}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- lokálny DEMO náhľad */}
                  <img src={p.src} alt={`Fotka k: ${p.title}`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">{p.title}</p>
                      <p className="text-[13px] text-ink-muted">{p.source} · metadáta odstránené</p>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                  <Actions>
                    {p.status === "pending" ? (
                      <>
                        <ActionBtn
                          kind="approve"
                          onClick={() => {
                            setPhotoStatus(p.key, "approved");
                            addAudit(`Schválená fotka (${p.title})`);
                          }}
                        >
                          Schváliť
                        </ActionBtn>
                        <ActionBtn
                          kind="reject"
                          onClick={() => {
                            setPhotoStatus(p.key, "rejected");
                            addAudit(`Zamietnutá fotka (${p.title})`);
                          }}
                        >
                          Zamietnuť
                        </ActionBtn>
                      </>
                    ) : (
                      <ActionBtn kind="neutral" onClick={() => setPhotoStatus(p.key, "pending")}>
                        Vrátiť do fronty
                      </ActionBtn>
                    )}
                  </Actions>
                </Card>
              ))}
            </ul>
          ))}

        {tab === "reports" &&
          (reports.length === 0 ? (
            <Empty text="Žiadne nahlásenia." />
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/miesto/${r.placeId}`} className="text-[16px] font-semibold text-ink underline-offset-2 hover:underline">
                        {placeName(r.placeId)}
                      </Link>
                      <p className="text-[14px] text-ink">{r.reason}</p>
                      <p className="text-[12.5px] text-ink-muted">
                        {fmt(r.createdAt)} · {r.mine ? "vaše nahlásenie" : "ukážkové nahlásenie"}
                      </p>
                    </div>
                    <StatusPill status={r.status} />
                  </div>
                  {r.note && <p className="mt-2 text-[14.5px] leading-relaxed text-ink">{r.note}</p>}
                  <Actions>
                    <ActionBtn
                      kind={r.status === "open" ? "approve" : "neutral"}
                      onClick={() => {
                        const next = r.status === "open" ? "resolved" : "open";
                        setReports((all) => all.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
                        addAudit(`${next === "resolved" ? "Vyriešené" : "Znovu otvorené"} nahlásenie (${placeName(r.placeId)})`);
                      }}
                    >
                      {r.status === "open" ? "Označiť ako vyriešené" : "Znovu otvoriť"}
                    </ActionBtn>
                  </Actions>
                </Card>
              ))}
            </ul>
          ))}

        {tab === "reviews" &&
          (reviews.length === 0 ? (
            <Empty text="Zatiaľ žiadne vaše DEMO hodnotenia. Ukážkové recenzie z dát sa tu nemoderujú." />
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold text-ink">{placeName(r.placeId)}</p>
                      <p className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-amber-700">
                        <StarIcon size={13} className="text-amber-400" /> {r.overall} / 10
                        <span className="font-normal text-ink-muted"> · {fmt(r.createdAt)}</span>
                      </p>
                    </div>
                    <StatusPill status={r.hidden ? "hidden" : "visible"} />
                  </div>
                  {r.text && <p className="mt-2 text-[14.5px] leading-relaxed text-ink">{r.text}</p>}
                  <Actions>
                    <ActionBtn
                      kind={r.hidden ? "neutral" : "reject"}
                      onClick={() => {
                        setReviews((all) => all.map((x) => (x.id === r.id ? { ...x, hidden: !x.hidden } : x)));
                        addAudit(`${r.hidden ? "Obnovená" : "Skrytá"} recenzia (${placeName(r.placeId)}), hodnotenie nezmenené`);
                      }}
                    >
                      {r.hidden ? "Znovu zverejniť" : "Skryť recenziu"}
                    </ActionBtn>
                  </Actions>
                </Card>
              ))}
            </ul>
          ))}
      </section>

      <section aria-labelledby="audit-title" className="mt-10">
        <h2 id="audit-title" className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          Záznam zásahov
        </h2>
        {audit.length === 0 ? (
          <p className="mt-2 text-[14px] text-ink-muted">Zatiaľ bez zásahov.</p>
        ) : (
          <ol className="mt-3 divide-y divide-line rounded-[22px] bg-white px-4 ring-1 ring-line">
            {audit.map((a) => (
              <li key={a.id} className="flex justify-between gap-3 py-2.5 text-[14px]">
                <span className="text-ink">{a.action}</span>
                <span className="shrink-0 text-ink-muted">{fmt(a.at)}</span>
              </li>
            ))}
          </ol>
        )}
        <button
          type="button"
          onClick={() => {
            resetCommunityDemo();
            resetAdminSeed();
            seedAdminDemo();
          }}
          className="mt-4 min-h-10 text-[14px] font-semibold text-ink-muted underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        >
          Vymazať všetky DEMO zápisy a obnoviť ukážky
        </button>
      </section>
    </div>
  );
}
