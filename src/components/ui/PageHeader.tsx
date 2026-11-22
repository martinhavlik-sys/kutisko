export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="pb-2 pt-[max(env(safe-area-inset-top),18px)]">
      <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em] text-ink sm:text-[36px]">{title}</h1>
      {subtitle && <p className="mt-1 text-[15px] text-ink-muted">{subtitle}</p>}
    </header>
  );
}
