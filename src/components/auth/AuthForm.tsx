"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { loginDemo, logoutDemo, registerDemo, useAccount } from "@/lib/account";
import { firstName, hasErrors, PASSWORD_MIN, validateLogin, validateRegistration } from "@/lib/validation";
import { DemoNotice, FieldError, primaryBtn, secondaryBtn } from "@/components/forms/FormParts";
import { Logo } from "@/components/ui/Logo";

type Mode = "login" | "register";

const inputCls =
  "mt-2 h-12 w-full rounded-2xl bg-white px-4 text-[16px] text-ink ring-1 ring-line placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-coral-600";

const COPY = {
  register: {
    title: "Vytvorte si účet",
    lead: "Uložené miesta, hodnotenia a návrhy budete mať pod jedným menom.",
    submit: "Vytvoriť účet",
    switchText: "Už máte účet?",
    switchLink: "Prihlásiť sa",
    switchHref: "/prihlasenie",
  },
  login: {
    title: "Vitajte späť",
    lead: "Prihláste sa a pokračujte tam, kde ste skončili.",
    submit: "Prihlásiť sa",
    switchText: "Ešte nemáte účet?",
    switchLink: "Vytvoriť účet",
    switchHref: "/registracia",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { account } = useAccount();
  const copy = COPY[mode];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const errors: Partial<Record<"name" | "email" | "password" | "terms", string>> = !submitted
    ? {}
    : mode === "register"
      ? validateRegistration({ name, email, password, terms })
      : validateLogin({ email, password });
  const errCount = Object.keys(errors).length;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setNotFound(false);
    const errs = mode === "register" ? validateRegistration({ name, email, password, terms }) : validateLogin({ email, password });
    if (hasErrors(errs)) {
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 0);
      return;
    }
    setBusy(true);
    if (mode === "register") {
      registerDemo(name, email);
      router.replace("/vitaj?novy=1");
      return;
    }
    if (!loginDemo(email)) {
      setBusy(false);
      setNotFound(true);
      return;
    }
    // Rozhodnutie Martina: krátke uvítanie po každom prihlásení; odtiaľ jedným ťuknutím do vyhľadávania.
    router.replace("/vitaj");
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex items-center justify-between py-2">
        <Link
          href="/"
          aria-label="Späť na Domov"
          className="-ml-2 flex size-11 items-center justify-center rounded-full text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </Link>
        <Logo height={24} />
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-700">DEMO</span>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="relative mt-6">
          <Image
            src="/illustrations/dieta-lopta.png"
            alt=""
            width={681}
            height={674}
            priority
            className="pointer-events-none absolute -top-3 right-0 h-auto w-[76px] select-none"
          />
          <h1 className="pr-24 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-ink">{copy.title}</h1>
          <p className="mt-2 pr-20 text-[15px] leading-relaxed text-ink-muted">{copy.lead}</p>
        </div>

        {account ? (
          <section className="mt-8 rounded-[26px] bg-white p-5 text-center shadow-card ring-1 ring-line" aria-live="polite">
            <p className="text-[16px] text-ink">
              Ste prihlásení ako <strong className="font-semibold">{account.name}</strong>.
            </p>
            <p className="mt-1 text-[13.5px] text-ink-muted">{account.email} · DEMO účet</p>
            <div className="mt-5 flex flex-col gap-2.5">
              <Link href="/" className={primaryBtn}>
                Pokračovať, {firstName(account.name)}
              </Link>
              <button type="button" onClick={logoutDemo} className={secondaryBtn}>
                Odhlásiť sa
              </button>
            </div>
          </section>
        ) : (
          <form ref={formRef} noValidate onSubmit={onSubmit} className="mt-7 space-y-5">
            <DemoNotice>
              DEMO — účet existuje iba v tomto prehliadači. Heslo sa nikam neukladá ani neoveruje. Použite vymyslené údaje, napr.
              rodic@example.com.
            </DemoNotice>

            {submitted && errCount > 0 && (
              <p role="alert" className="rounded-2xl bg-coral-50 px-4 py-3 text-[14px] font-medium text-coral-700">
                {errCount === 1 ? "Jedno pole treba opraviť." : `${errCount} polia treba opraviť.`}
              </p>
            )}
            {notFound && (
              <div role="alert" className="rounded-2xl bg-coral-50 px-4 py-3 text-[14px] text-coral-700">
                <p className="font-medium">Účet s týmto e-mailom v tomto prehliadači nie je.</p>
                <p className="mt-1">
                  DEMO účty sa nezdieľajú medzi zariadeniami.{" "}
                  <Link href="/registracia" className="font-semibold underline underline-offset-2">
                    Vytvorte si účet
                  </Link>{" "}
                  za pár sekúnd.
                </p>
              </div>
            )}

            {mode === "register" && (
              <div>
                <label htmlFor="a-name" className="text-[15px] font-semibold text-ink">
                  Ako vás máme oslovovať?
                </label>
                <input
                  id="a-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "a-name-err" : undefined}
                  autoComplete="given-name"
                  placeholder="napr. Jana"
                  className={inputCls}
                />
                <FieldError id="a-name-err" message={errors.name} />
              </div>
            )}

            <div>
              <label htmlFor="a-email" className="text-[15px] font-semibold text-ink">
                E-mail
              </label>
              <input
                id="a-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "a-email-err" : undefined}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="rodic@example.com"
                className={inputCls}
              />
              <FieldError id="a-email-err" message={errors.email} />
            </div>

            <div>
              <label htmlFor="a-pass" className="text-[15px] font-semibold text-ink">
                Heslo
              </label>
              <div className="relative">
                <input
                  id="a-pass"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={[mode === "register" ? "a-pass-hint" : "", errors.password ? "a-pass-err" : ""].filter(Boolean).join(" ") || undefined}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className={`${inputCls} pr-24`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-controls="a-pass"
                  className="absolute right-1.5 top-[calc(50%+4px)] min-h-10 -translate-y-1/2 rounded-full px-3 text-[14px] font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
                >
                  {showPassword ? "Skryť" : "Zobraziť"}
                </button>
              </div>
              {mode === "register" && (
                <p id="a-pass-hint" className="mt-1.5 text-[13px] text-ink-muted">
                  Aspoň {PASSWORD_MIN} znakov.
                </p>
              )}
              <FieldError id="a-pass-err" message={errors.password} />
            </div>

            {mode === "register" && (
              <div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    aria-invalid={!!errors.terms}
                    aria-describedby={errors.terms ? "a-terms-err" : undefined}
                    className="mt-0.5 size-5 shrink-0 accent-coral-600"
                  />
                  <span className="text-[14px] leading-relaxed text-ink">
                    Rozumiem, že ide o skúšobný DEMO účet a nezadávam skutočné osobné údaje.
                  </span>
                </label>
                <FieldError id="a-terms-err" message={errors.terms} />
              </div>
            )}

            <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
              {copy.submit}
            </button>

            <p className="text-center text-[14.5px] text-ink-muted">
              {copy.switchText}{" "}
              <Link href={copy.switchHref} className="inline-flex min-h-11 items-center font-semibold text-coral-600 underline-offset-2 hover:underline">
                {copy.switchLink}
              </Link>
            </p>
          </form>
        )}

        <p className="mt-auto pt-8 text-center text-[13px] leading-relaxed text-ink-muted">
          Účet potrebujete len na ukladanie, hodnotenie a pridávanie fotiek. Prezerať môžete aj bez neho:{" "}
          <Link href="/" className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-2">
            pokračovať bez účtu
          </Link>
        </p>
      </main>
    </div>
  );
}
