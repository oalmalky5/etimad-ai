import { prisma } from "@/lib/prisma";
import { scoreTenderMatch } from "@/lib/matching/score-tender";
import Link from "next/link";
import { DecisionControls } from "../decision-controls";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Riyadh",
});

function formatDate(date: Date | null): string {
  return date ? dateFormatter.format(date) : "Not provided";
}

function scoreTone(score: number): string {
  if (score >= 70) {
    return "bg-[var(--accent)] text-white";
  }
  if (score >= 40) {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-[var(--background)] text-[var(--muted)]";
}

export default async function RecommendedTendersPage() {
  const [profile, tenders] = await Promise.all([
    prisma.companyProfile.findUnique({ where: { id: "primary" } }),
    prisma.tender.findMany({
      where: { NOT: { decision: { is: { status: "IGNORED" } } } },
      orderBy: { publishedAt: "desc" },
      take: 120,
      select: {
        id: true,
        referenceNumber: true,
        titleArabic: true,
        descriptionArabic: true,
        agencyNameArabic: true,
        activityNameArabic: true,
        classificationFieldArabic: true,
        executionRegionArabic: true,
        tenderTypeNameArabic: true,
        submissionDeadline: true,
        detailEnrichmentStatus: true,
        decision: { select: { status: true } },
      },
    }),
  ]);

  const recommendations = profile
    ? tenders
        .map((tender) => ({
          tender,
          match: scoreTenderMatch(profile, tender),
        }))
        .filter(({ match }) => match.score > 0)
        .sort(
          (left, right) =>
            right.match.score - left.match.score ||
            left.tender.referenceNumber.localeCompare(
              right.tender.referenceNumber,
            ),
        )
    : [];

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/tenders" className="font-semibold hover:text-[var(--accent)]">
            ← Discover tenders
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/company" className="hover:text-[var(--accent)]">
              Company profile
            </Link>
            <Link href="/tenders/saved" className="hover:text-[var(--accent)]">
              Saved
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="border-b border-[var(--border)] pb-9">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Rule-based matching
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Recommended opportunities
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
            Tenders are ranked using explicit company preferences and available
            public data. Scores indicate relevance, not confirmed eligibility.
          </p>
        </section>

        {!profile ? (
          <section className="mt-8 rounded-3xl border border-dashed border-[var(--border-strong)] bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">Create a company profile first</h2>
            <p className="mt-2 text-[var(--muted)]">
              Recommendations need structured services, activities, keywords,
              and preferences.
            </p>
            <Link
              href="/company"
              className="mt-5 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Create company profile
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{profile.companyName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Found {recommendations.length} relevant candidates from{" "}
                    {tenders.length} non-ignored tenders.
                  </p>
                </div>
                <Link
                  href="/company"
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Edit matching profile →
                </Link>
              </div>
            </section>

            {recommendations.length === 0 ? (
              <section className="mt-8 rounded-3xl border border-dashed border-[var(--border-strong)] bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-semibold">No explicit matches yet</h2>
                <p className="mt-2 text-[var(--muted)]">
                  Add more activities, services, keywords, or target entities
                  to the company profile.
                </p>
              </section>
            ) : (
              <div className="mt-6 grid gap-5">
                {recommendations.map(({ tender, match }) => (
                <article
                  key={tender.id}
                  className="rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-7"
                >
                  <div className="grid gap-6 lg:grid-cols-[7rem_minmax(0,1fr)_14rem]">
                    <div>
                      <div
                        className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl ${scoreTone(match.score)}`}
                      >
                        <span className="text-2xl font-semibold">{match.score}%</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          relevance
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--muted)]">
                        Ref. {tender.referenceNumber}
                      </p>
                      <Link
                        href={`/tenders/${tender.id}`}
                        dir="rtl"
                        lang="ar"
                        className="mt-2 block text-right text-xl font-semibold leading-8 hover:text-[var(--accent)]"
                      >
                        {tender.titleArabic}
                      </Link>
                      <p
                        dir="rtl"
                        lang="ar"
                        className="mt-2 text-right text-sm text-[var(--muted)]"
                      >
                        {tender.agencyNameArabic}
                      </p>

                      {match.reasons.length > 0 ? (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                            Why it matches
                          </p>
                          <ul className="mt-2 grid gap-1.5 text-sm leading-6">
                            {match.reasons.map((reason) => (
                              <li key={reason}>+ {reason}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="mt-5 text-sm text-[var(--muted)]">
                          No explicit profile preferences matched.
                        </p>
                      )}

                      {match.concerns.length > 0 && (
                        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                          <p className="font-semibold">Possible concerns</p>
                          <ul className="mt-1.5 grid gap-1 leading-6">
                            {match.concerns.map((concern) => (
                              <li key={concern}>- {concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[var(--border)] pt-4 text-sm lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                      <p className="text-xs text-[var(--muted)]">
                        Submission deadline
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatDate(tender.submissionDeadline)}
                      </p>
                      <p className="mt-4 text-xs text-[var(--muted)]">
                        Activity
                      </p>
                      <p dir="rtl" lang="ar" className="mt-1 text-right">
                        {tender.activityNameArabic ?? "Not provided"}
                      </p>
                      <div className="mt-5">
                        <DecisionControls
                          tenderId={tender.id}
                          status={tender.decision?.status ?? null}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
