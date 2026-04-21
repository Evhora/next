# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (v10, see `packageManager` in `package.json`). Node version is pinned in `.nvmrc`.

- `pnpm dev` — start Next.js dev server (runs `proto:gen` first via `predev`).
- `pnpm build` — production build (also regenerates proto first).
- `pnpm lint` — run ESLint (`next/core-web-vitals` + `next/typescript`). Generated `*_pb.ts` files are ignored.
- `pnpm proto:gen` — regenerate TypeScript from `.proto` files. Emits `*_pb.ts` next to each `.proto` under `src/modules/<ctx>/proto/v1/`.
- `pnpm proto:lint` / `pnpm proto:format` / `pnpm proto:breaking` — buf linting, formatting, and breaking-change checks (against `main`).

There is no test runner configured. Supabase CLI is a devDependency; migrations live in `supabase/migrations/` and run against a local Supabase stack.

## Architecture

Next.js 15 (App Router, React 19) on top of Supabase Auth + Postgres, with `next-intl` for i18n (locale hardcoded to `pt-BR` in [src/shared/i18n/config.ts](src/shared/i18n/config.ts)).

### Modular Clean Architecture

Each bounded context lives under `src/modules/<ctx>/` with four layers:

- `domain/` — entities, repository **interfaces**, errors, labels. Pure TS; no Supabase, no Next.
- `application/` — use cases as plain async functions taking a `cmd` plus a context object (`{ userId, dreams, ... }`). Validates with zod schemas in `schemas.ts`, throws `AppError` subclasses on domain failures.
- `infrastructure/` — concrete repositories (e.g. `SupabaseDreamRepository`). Only layer that imports Supabase.
- `ui/` — React components and `"use server"` actions that wrap use cases.
- `proto/v1/` — `.proto` sources; generated `*_pb.ts` is committed and consumed as the domain type.
- `index.ts` — the module's **public surface**. Code outside the module must import from here, never reach into `domain/`/`application/`/`infrastructure/`.

Existing modules: `dreams`, `actions`, `dream-board`, `dashboard`, `settings`, `auth`, `shared`.

### Composition root

[src/shared/context.ts](src/shared/context.ts) is the **only** place Supabase clients are wired to repositories. `buildCtx()` (wrapped in React `cache`) authenticates the request, throws `UnauthorizedError` if there's no user, and returns an `AppContext` containing `user`, `userId`, and every repo. Use cases receive this context and depend on the interfaces. To add a repo, add a field here and nothing else changes.

`tryBuildCtx()` is the null-returning variant for code that may run pre-login.

### Server actions pattern

Actions in `<module>/ui/actions.ts` are thin shells: `buildCtx()` → parse `FormData` into the use-case command → invoke → `revalidatePath()` → return `ActionResult`. Actions **never throw across the wire**: they wrap in try/catch and convert via `failFromError` ([src/shared/result.ts](src/shared/result.ts)). Use cases still throw — the action layer translates.

`ActionResult<T>` is the discriminated union `{ ok: true, data } | { ok: false, code, message }` that client components consume.

### Protobuf as domain types

Domain entities (e.g. `Dream`) **are** the generated proto messages. Factory/mutator functions in `domain/*.ts` (`newDream`, `dreamWithStatus`, `softDeleteDream`) enforce invariants and treat messages as immutable — mutators return new values with a bumped `version` and fresh `updatedAt`.

- buf uses a single module rooted at `src/` ([buf.yaml](buf.yaml)); package paths mirror directories (`modules.<ctx>.proto.v1`). The `buf.gen.yaml` config emits into `.` with `import_extension=none` and `json_types=true`.
- Generated names are preserved verbatim (no short aliases) so TS matches wire identifiers.
- JSON conversion goes through [src/shared/proto/json.ts](src/shared/proto/json.ts) (`toProtoJson` / `fromProtoJson`).

### Supabase persistence

Tables (`dreams`, `actions`, `sentences`) use a **JSONB `data` column** storing the full proto message, plus promoted columns (`id`, `user_id`, `*_at`) used only for RLS, indexes, and ordering. Repositories read `data` and decode via `fromProtoJson`; writes emit `toProtoJson` into `data` and mirror timestamps into promoted columns.

RLS is enabled and policies scope by `auth.uid()`. Repositories **additionally** filter by `user_id` in every query — RLS plus belt-and-suspenders so a leaked id can't leak existence either.

Middleware at [proxy.ts](proxy.ts) calls `updateSession` to refresh Supabase cookies on every request (except static/image routes). Clients: `src/shared/supabase/{client,server,middleware}.ts`.

### Path aliases

`@/*` resolves to both `./src/*` and `./*` (see `tsconfig.json`). In practice, always import from `@/modules/...`, `@/shared/...`, or `@/app/...`.

### UI

Tailwind + shadcn-style primitives in [src/shared/ui/](src/shared/ui/) (Radix under the hood). Layout shell in [src/shared/layout/](src/shared/layout/). Dashboard pages live under `app/dashboard/`, auth pages under `app/auth/`.
