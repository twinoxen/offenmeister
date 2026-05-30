# CLAUDE.md

Guidance for working in this repository.

## What this is

Offenmeister — a cloze-deletion (fill-in-the-blank) language-learning web app. Nuxt 4 (Vue 3 +
TypeScript) frontend, Convex backend + database + auth.

## Architecture notes

- **Convex is the backend.** Queries/mutations/actions live in `convex/*.ts`. Run `npx convex dev`
  to push code and regenerate `convex/_generated/` (which is committed so the frontend type-checks
  and builds without a running backend).
- **Auth runs inside Convex** via Better Auth (`@convex-dev/better-auth`), surfaced to Nuxt by the
  `better-convex-nuxt` module. Each Better Auth user is mirrored into our `users` table by the
  inline triggers in `convex/auth.ts` (keyed by `authId`). Resolve the current app user with
  `getCurrentUser` / `requireCurrentUser` from `convex/model/users.ts`.
- **Pure logic lives in `convex/lib/`** (`cloze.ts`, `srs.ts`, `scoring.ts`). It has no Convex or
  Nuxt imports, is imported by both sides, and is the only thing unit-tested. Put new
  business rules here when you can, and add Vitest coverage (`convex/lib/*.test.ts`).

## Gotchas (important)

- **Never import `better-convex-nuxt/server` into a `convex/` file** — it pulls Nuxt/Nitro into the
  Convex bundle and breaks `convex dev`. The user-sync triggers are inlined in `convex/auth.ts` for
  this reason.
- **Nuxt loses instance context across `await`.** In a page `setup`, invoke every `useConvex*`
  composable *before the first `await`*, or wrap later calls in `nuxtApp.runWithContext(() => …)`.
  See `useActivePair` and the pages for the pattern.
- **`useConvexMutation` / `useConvexAction` are client-only** (they need the websocket client).
  Create them under `import.meta.client` or render the component inside `<ClientOnly>`. Queries
  (`useConvexQuery`) work during SSR over HTTP and are fine to `await`.
- Front-end imports of Convex code use the `~~/convex/...` alias (root dir), e.g.
  `~~/convex/_generated/api` and `~~/convex/lib/cloze`.

## Validate changes

```bash
npm run test     # Vitest — fast, no backend needed
npm run lint
npm run build    # needs CONVEX_URL in env (npm run dev loads .env.local automatically)
```

For full runtime checks, run `npx convex dev` + `npm run dev` and exercise signup → pick a
language → play a collection.

## Conventions

- TypeScript throughout; 2-space indent; single quotes; no semicolons (matches existing files).
- Keep the original product being cloned unnamed in code and docs.
