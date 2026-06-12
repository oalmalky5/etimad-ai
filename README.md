# Etimad Tender Intelligence

An English-first tender discovery and monitoring platform for Saudi government
procurement.

## Foundation Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Prisma ORM
- Local Prisma Postgres for development

## Local Setup

Install dependencies:

```bash
npm install
```

Start the local database in one terminal:

```bash
npm run db:dev
```

Copy the connection strings printed by Prisma into `.env`, then validate the
Prisma schema:

```bash
npm run db:validate
```

Start the web application in another terminal:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Checks

```bash
npm run lint
npm run build
npm run db:validate
```

## Project Documents

- `ROADMAP.md`: product and implementation roadmap
- `MILESTONE_0_ETIMAD_DATA.md`: Etimad data-access investigation
- `LEARNING_NOTES.md`: concepts and decisions learned while building
