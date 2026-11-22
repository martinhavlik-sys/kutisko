"use client";

import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((msg: string) => {
    setMessage(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 2600);
  }, []);
  return { message, show };
}

export function Toast({ message, offset = 76 }: { message: string | null; offset?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ bottom: `calc(${offset}px + env(safe-area-inset-bottom))` }}
      className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-5 transition duration-200 ${
        message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {message && (
        <span className="max-w-sm rounded-2xl bg-ink px-4 py-3 text-center text-[14px] font-medium text-white shadow-float">
          {message}
        </span>
      )}
    </div>
  );
}
