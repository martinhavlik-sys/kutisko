"use client";

import { createDemoStore } from "./demoStore";

/**
 * Simulovaný účet (PROTOTYPE_BRIEF bod 8, manifest bod 18).
 * Žiadna skutočná autentifikácia: účty sú iba v localStorage tohto prehliadača,
 * heslo sa nikde neukladá ani neoveruje.
 */
export interface DemoAccount {
  name: string;
  email: string;
  createdAt: string;
}

interface AccountState {
  accounts: DemoAccount[];
  currentEmail: string | null;
}

const store = createDemoStore<AccountState>("kutisko.demo.account", { accounts: [], currentEmail: null });

const normEmail = (email: string) => email.trim().toLowerCase();

export function registerDemo(name: string, email: string): DemoAccount {
  const account: DemoAccount = { name: name.trim(), email: normEmail(email), createdAt: new Date().toISOString() };
  const prev = store.read();
  store.write({
    accounts: [...prev.accounts.filter((a) => a.email !== account.email), account],
    currentEmail: account.email,
  });
  return account;
}

/** Vráti účet, ak v tomto prehliadači existuje. Heslo sa v prototype neoveruje. */
export function loginDemo(email: string): DemoAccount | null {
  const prev = store.read();
  const account = prev.accounts.find((a) => a.email === normEmail(email)) ?? null;
  if (account) store.write({ ...prev, currentEmail: account.email });
  return account;
}

export function logoutDemo() {
  store.write({ ...store.read(), currentEmail: null });
}

export function useAccount() {
  const [state] = store.useStore();
  const account = state.accounts.find((a) => a.email === state.currentEmail) ?? null;
  return { account, hasAccounts: state.accounts.length > 0 };
}
