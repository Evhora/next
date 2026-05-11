---
name: evhora-engineer
description: Use this skill whenever you start coding a new feature or fixing a bug in the evhora codebase — including any change touching src/modules/*, src/app/*, src/shared/*, supabase/migrations/*, or *.proto files. Enforces the project's modular clean architecture (DDD layering, proto-as-domain, ActionResult, buildCtx composition root, Supabase JSONB persistence), keeps changes minimal and idiomatic, and verifies with lint + typecheck + proto:gen before declaring done. Trigger on any phrasing like "add X to dreams", "fix the Y action", "let me change Z", "implement the feature for…", even if the user does not name the layer or module.
---

# Evhora Engineer

Work in this repo the way a senior engineer who already owns the codebase would: small, surgical changes that respect the existing seams. Read [CLAUDE.md](../../../CLAUDE.md) first if anything below is ambiguous — it is the source of truth and may have moved on past this skill.

## Operating principles

1. **Prefer editing over creating.** Do not introduce new modules, new files, new abstractions, new dependencies, or new top-level concepts on your own. If a change seems to require one (e.g. a brand-new bounded context, a new shared util, a new Supabase table, a new repo interface, a new shadcn primitive), stop and ask the user before doing it. Adding a field, a function, a use case, or a server action inside an existing module is fine — that is normal work.
2. **Stay inside the layer.** `domain/` is pure TS, `application/` orchestrates use cases against repo *interfaces*, `infrastructure/` is the only place that touches Supabase, `ui/` holds React + `"use server"` actions, `proto/v1/` holds wire types. Never let Supabase leak above infrastructure. Never reach into another module's internals — import from its `index.ts`.
3. **Don't comment for commenting.** Names should already say what the code does. Write a comment only when the *why* is non-obvious — a hidden invariant, a subtle constraint, a workaround for a specific bug. If removing the comment wouldn't confuse a future reader, don't write it. Never narrate the task or PR ("added for the X flow") in code.
4. **No defensive bloat.** No fallbacks for cases that can't happen, no compatibility shims, no feature flags you won't use. Validate at boundaries (zod in `schemas.ts`, RLS + repo `user_id` filter at the DB), trust internal callers between them.
5. **Match the task scope.** A bug fix changes what is broken and nothing else. A feature touches the layers it must and stops. No surrounding cleanups, no refactors, no "while I'm here" — surface those as follow-ups instead.

## The flow for a new feature or bug fix

Follow this loop. It is short on purpose.

### 1. Locate the work

- Identify the module(s) involved (`dreams`, `actions`, `dream-board`, `dashboard`, `settings`, `auth`, `shared`). If the change crosses modules, the public boundary is each module's `index.ts`.
- Find the layer the change actually belongs in. Most "add a field" changes touch four places in order: `.proto` → run `pnpm proto:gen` → `domain/` factories/mutators → `application/` use case (+ `schemas.ts`) → `infrastructure/` repo mapping → `ui/` action + component. Bug fixes are usually one layer.
- Read the neighbours (sibling use cases, the existing repo, the existing action) before writing. The repo has strong patterns — mimic them exactly rather than inventing.

### 2. Make the change

Apply the rules per layer:

- **Proto:** edit the `.proto`, run `pnpm proto:gen`. Generated `*_pb.ts` is committed. Don't hand-edit generated files. Keep names verbatim — no short aliases. Use `json_types=true` shapes via `toProtoJson` / `fromProtoJson` for any (de)serialization, never `JSON.parse` directly on proto messages.
- **Domain:** entities **are** the proto messages. Treat them as immutable: mutator functions return a new value with bumped `version` and fresh `updatedAt` (see `newDream`, `dreamWithStatus`, `softDeleteDream` for the shape). Repository interfaces live here; concrete classes do not.
- **Application:** a use case is `async function doX(cmd, ctx)`. Parse `cmd` with the zod schema in `schemas.ts` first. Depend only on repo interfaces from `ctx`. Throw `AppError` subclasses for domain failures — never return error tuples here; the action layer translates.
- **Infrastructure:** repositories read `data` (JSONB) and decode via `fromProtoJson`; writes emit `toProtoJson` into `data` and mirror promoted columns (`id`, `user_id`, `*_at`). **Always** filter by `user_id` in every query — RLS plus belt-and-suspenders. New repos must be wired in [src/shared/context.ts](../../../src/shared/context.ts) `buildCtx()`; that is the only composition root.
- **UI / server actions:** actions in `<module>/ui/actions.ts` are thin shells — `buildCtx()` → parse `FormData` into the use-case command → invoke → `revalidatePath()` → return `ActionResult`. Wrap in try/catch and translate via `failFromError` from [src/shared/result.ts](../../../src/shared/result.ts). Actions never throw across the wire. Client components consume `ActionResult<T>` as a discriminated union.
- **Imports:** always `@/modules/<ctx>`, `@/shared/...`, `@/app/...`. Never deep-import another module's `domain/`/`application/`/`infrastructure/`.
- **i18n:** locale is hardcoded to `pt-BR` in [src/shared/i18n/config.ts](../../../src/shared/i18n/config.ts). New user-facing strings go through `next-intl`, not inline literals.
- **UI primitives:** use shadcn-style primitives in [src/shared/ui/](../../../src/shared/ui/). Don't pull in a new Radix/UI dependency without asking.

### 3. Verify before declaring done

Run these in parallel and resolve everything before reporting back:

```bash
pnpm proto:gen   # only if you touched .proto
pnpm lint
pnpm tsc --noEmit
```

If any fail, fix the root cause — don't suppress, don't `// @ts-expect-error`, don't `eslint-disable` unless the user explicitly asked. There is no test runner configured in this repo; do not invent one. For UI changes, the spec says to use the feature in the browser before claiming success — if you cannot, say so explicitly instead of asserting it works.

### 4. Report

One or two sentences: what changed, where, and what (if anything) you noticed but deliberately did not touch. List any follow-ups instead of doing them.

## When to stop and ask

Ask the user before proceeding if any of these are true:

- You'd need to create a **new module**, a **new file in `src/shared/`**, a **new Supabase table or migration**, a **new repo interface**, a **new dependency in package.json**, or a **new `.proto` file**.
- The change crosses a module boundary in a way the existing `index.ts` exports don't support.
- The "right" fix would require changing a public type used across the app (e.g. `AppContext`, `ActionResult`).
- RLS or auth assumptions would change.
- The task as stated seems to conflict with an existing pattern in the codebase — surface the conflict rather than picking silently.

Phrase the question concretely: name the file you'd create, the field you'd add, or the dependency you'd pull in, and offer the smallest alternative you can think of. Then wait.

## Anti-patterns to avoid

- Inline Supabase calls in `application/` or `ui/`.
- Server actions that `throw` instead of returning `ActionResult`.
- Mutating a proto message in place instead of returning a new one via a domain mutator.
- Repository queries that rely on RLS alone, without the explicit `user_id` filter.
- `JSON.parse` / `JSON.stringify` on proto messages — always go through `toProtoJson` / `fromProtoJson`.
- Adding `// TODO`, `// added for X`, or step-by-step "what this does" comments.
- Bundling unrelated refactors into a feature/fix change.
- Catching errors only to re-log and rethrow with no added information.
