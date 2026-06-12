import { tenderAiSummarySchema, type TenderAiSummaryContent } from "@/lib/ai/tender-summary-schema";

import { SummaryControls } from "./summary-controls";

type StoredSummary = {
  id: string;
  content: unknown;
  model: string;
  promptVersion: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: { toString(): string } | null;
  sourceTenderUpdatedAt: Date;
  sourceCompanyProfileUpdatedAt: Date | null;
  companyProfileId: string | null;
  generatedAt: Date;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Riyadh",
});

function SummaryList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted)]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--muted)]">None identified.</p>
      )}
    </div>
  );
}

function SummaryContent({ content }: { content: TenderAiSummaryContent }) {
  return (
    <>
      <p className="mt-4 leading-7 text-[var(--muted)]">{content.summary}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <SummaryList title="Requirements" items={content.requirements} />
        <SummaryList title="Deadline notes" items={content.deadlineNotes} />
        <SummaryList title="Risks" items={content.risks} />
        <SummaryList title="Company fit notes" items={content.fitNotes} />
        <SummaryList title="Questions to ask" items={content.questionsToAsk} />
        <SummaryList title="Next actions" items={content.nextActions} />
        <SummaryList
          title="Missing information"
          items={content.missingInformation}
        />
      </div>
    </>
  );
}

export function TenderSummaryPanel({
  tenderId,
  tenderUpdatedAt,
  currentCompanyProfile,
  summaries,
}: {
  tenderId: string;
  tenderUpdatedAt: Date;
  currentCompanyProfile: { id: string; updatedAt: Date } | null;
  summaries: StoredSummary[];
}) {
  const latest = summaries[0] ?? null;
  const parsedLatest = latest
    ? tenderAiSummarySchema.safeParse(latest.content)
    : null;
  const isStale =
    latest !== null &&
    (tenderUpdatedAt > latest.sourceTenderUpdatedAt ||
      (currentCompanyProfile?.id ?? null) !== latest.companyProfileId ||
      (currentCompanyProfile !== null &&
        (latest.sourceCompanyProfileUpdatedAt === null ||
          currentCompanyProfile.updatedAt >
            latest.sourceCompanyProfileUpdatedAt)));

  return (
    <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold">AI tender summary</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Generated manually from stored public tender data. It supports
            review, but does not confirm eligibility or predict success.
          </p>
        </div>
        <SummaryControls tenderId={tenderId} />
      </div>

      {!latest && (
        <p className="mt-6 rounded-2xl bg-[var(--background)] p-5 text-sm text-[var(--muted)]">
          No AI summary has been generated for this tender yet.
        </p>
      )}

      {latest && (
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-[var(--background)] px-3 py-1.5 text-[var(--muted)]">
              Generated {dateFormatter.format(latest.generatedAt)}
            </span>
            <span className="rounded-full bg-[var(--background)] px-3 py-1.5 text-[var(--muted)]">
              {latest.model} · {latest.promptVersion}
            </span>
            {isStale && (
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">
                Stale: tender or company profile changed
              </span>
            )}
          </div>

          {parsedLatest?.success ? (
            <SummaryContent content={parsedLatest.data} />
          ) : (
            <p className="mt-4 text-sm text-red-700">
              This stored summary does not match the current output schema.
            </p>
          )}

          <p className="mt-6 text-xs leading-5 text-[var(--muted)]">
            Usage: {latest.inputTokens ?? "unknown"} input tokens ·{" "}
            {latest.outputTokens ?? "unknown"} output tokens ·{" "}
            {latest.totalTokens ?? "unknown"} total tokens
            {latest.estimatedCostUsd
              ? ` · Estimated cost $${latest.estimatedCostUsd.toString()}`
              : ""}
            {" · "}
            {summaries.length} stored version{summaries.length === 1 ? "" : "s"}
          </p>

          {summaries.length > 1 && (
            <details className="mt-5 border-t border-[var(--border)] pt-5">
              <summary className="cursor-pointer text-sm font-semibold">
                View generation history
              </summary>
              <ol className="mt-3 space-y-2 text-xs text-[var(--muted)]">
                {summaries.map((summary, index) => (
                  <li key={summary.id}>
                    Version {summaries.length - index}:{" "}
                    {dateFormatter.format(summary.generatedAt)} · {summary.model} ·{" "}
                    {summary.totalTokens ?? "unknown"} tokens
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
