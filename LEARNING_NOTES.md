# Learning Notes

## Session 1 - Project Foundation

### Concepts Learned

- **Next.js App Router:** Files inside `src/app` define routes and layouts.
- **Server-first rendering:** App Router pages are server components unless
  they explicitly use `"use client"`.
- **Prisma schema:** `prisma/schema.prisma` describes database models and
  generates a typed TypeScript client.
- **Database connection URL:** The application can switch database environments
  by changing `DATABASE_URL`, without changing product code.
- **Reproducible builds:** Remote fonts made the initial build depend on Google
  Fonts, so the foundation uses system fonts instead.

### Decisions

- Use Next.js, TypeScript, Tailwind CSS, and Prisma.
- Use local Prisma Postgres during early development because Docker and a local
  PostgreSQL installation are not currently available.
- Keep the product schema out of Session 1. Design the `Tender` model carefully
  in Session 2.
- Keep `.env` private and commit only `.env.example`.

### Commands

```bash
npm run db:dev
npm run db:validate
npm run dev
npm run lint
npm run build
```

### You Should Be Able To Explain

- Why the web app and database run as separate processes.
- Why `.env` is ignored by Git.
- Why Prisma does not replace PostgreSQL.
- Why we validate and normalize Etimad data before storing it.

### Next Session

Design the first `Tender` model from the real Etimad list fields, create a
database migration, and inspect the resulting table.
