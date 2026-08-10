# Lærerrommet

Faglig KI-plattform for lærere i Osloskolen.

## Teknologi

- [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- [Prisma](https://www.prisma.io/) + [Neon](https://neon.tech/) (PostgreSQL)
- [NextAuth](https://next-auth.js.org/) med e-post/passord (credentials)
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic API](https://docs.anthropic.com/) (Claude) for KI-veilederen

## Kom i gang

1. Kopier `.env.example` til `.env` og fyll inn verdier:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` / `DIRECT_URL`: Neon Postgres-tilkoblingsstrenger (pooled og direct).
   - `NEXTAUTH_SECRET`: generer med `openssl rand -base64 32`.
   - `ANTHROPIC_API_KEY`: API-nøkkel for Claude.

2. Installer avhengigheter:

   ```bash
   npm install
   ```

3. Push databaseskjemaet til Neon:

   ```bash
   npm run db:push
   ```

4. Start utviklingsserveren:

   ```bash
   npm run dev
   ```

   Åpne [http://localhost:3000](http://localhost:3000).

## Sider

- `/login` og `/register` — innlogging og registrering med e-post/passord.
- `/dashboard` — velkomstmelding, kort til KI-veilederen og kommende funksjoner.
- `/veileder` — chatbot som svarer på spørsmål om KI-bruk i undervisningen, med
  faste startforslag. Systempromptet ligger hardkodet i backend
  (`src/lib/anthropic.ts`) og eksponeres aldri til frontend.

Alle sider under `/dashboard` og `/veileder`, samt `/api/chat`, er beskyttet av
NextAuth-middleware og krever innlogging.

## Database

- `User` (id, name, email, password (bcrypt-hashet), role, createdAt)
- `ChatMessage` (id, userId, role, content, createdAt)

## Sikkerhet

- Passord hashes med bcrypt (12 runder) før lagring.
- API-nøkler (Anthropic, database) brukes kun server-side og eksponeres aldri
  til klienten.
- Responsivt design med Tailwind CSS.
