export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Milestone 1 · Session 1
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Etimad Tender Intelligence
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          An English-first platform for discovering and monitoring relevant
          Saudi government tenders.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Application", "Next.js foundation ready"],
            ["Database", "Local Prisma Postgres ready"],
            ["Next step", "Design the Tender model"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
            >
              <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
              <p className="mt-2 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
