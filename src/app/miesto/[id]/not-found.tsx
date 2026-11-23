import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted">404</p>
      <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.02em] text-ink">Toto miesto sme nenašli</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
        Odkaz môže byť neplatný alebo miesto už nie je v katalógu.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-coral-600 px-6 text-[15px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Späť na Domov
      </Link>
    </main>
  );
}
