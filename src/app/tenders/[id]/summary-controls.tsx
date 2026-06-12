"use client";

import { useActionState } from "react";

import {
  generateTenderSummaryAction,
  initialSummaryActionState,
} from "./summary-actions";

export function SummaryControls({ tenderId }: { tenderId: string }) {
  const [state, formAction, pending] = useActionState(
    generateTenderSummaryAction,
    initialSummaryActionState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="tenderId" value={tenderId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Generating summary..." : "Summarize tender"}
      </button>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${
            state.status === "error" ? "text-red-700" : "text-[var(--muted)]"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
