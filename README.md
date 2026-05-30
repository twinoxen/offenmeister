# Offenmeister

Learn languages the way you actually use them — by filling in the blank. Offenmeister
teaches vocabulary through **cloze sentences** (a real sentence with one word removed),
schedules reviews with **spaced repetition**, organizes content into **frequency-ordered
collections**, and keeps you coming back with **points, levels, and streaks**. Stuck on a
sentence? Optional **on-demand AI explanations** give you a grammar breakdown, a hint, and a
fresh example.

> Built with **Nuxt 4** (Vue 3 + TypeScript) on the front end and **Convex** for the backend,
> database, and authentication.

## Features

- **Cloze play modes** — multiple choice or type-the-answer, with translation hints and
  text-to-speech (browser `SpeechSynthesis`, no network needed).
- **Spaced repetition** — a Leitner-style ladder (`New → Learning → … → Mastered`) reschedules
  each sentence based on how you answer.
- **Collections & languages** — Spanish, French, and German (from English) out of the box,
  split into frequency bands. The schema scales to any number of language pairs.
- **Gamification** — points (typing is worth more than multiple choice), player levels, daily
  streaks, a daily goal, and accuracy/mastery stats.
- **AI assistance** — an "✨ Explain" button calls Claude for a grammar breakdown, a hint, and
  an example. Gracefully hidden when no API key is configured.
- **Auth** — email/password handled by Better Auth running *inside* Convex.

## Tech stack

| Layer    | Choice |
| -------- | ------ |
| Frontend | Nuxt 4, Vue 3, TypeScript, Tailwind CSS |
| Backend  | Convex (queries / mutations / actions) |
| Auth     | Better Auth via `@convex-dev/better-auth`, wired into Nuxt by `better-convex-nuxt` |
| Tests    | Vitest (pure SRS / scoring / cloze logic) |

## Getting started

Prerequisites: Node 20+.

```bash
npm install

# 1. Start Convex (creates a local deployment the first time — no account needed).
npx convex dev            # keep running in its own terminal

# 2. Configure the deployment's environment variables (one-time):
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL "http://localhost:3000"
# Optional — enables the AI "Explain" feature:
# npx convex env set ANTHROPIC_API_KEY "sk-ant-..."

# 3. Load the bundled sentences (idempotent):
npm run seed              # = npx convex run seed:run

# 4. Start the Nuxt app:
npm run dev               # http://localhost:3000
```

`npx convex dev` writes `CONVEX_URL` / `CONVEX_DEPLOYMENT` into `.env.local`. See
`.env.example` for the full list of variables.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Nuxt dev server |
| `npm run dev:convex` | Start the Convex backend (`convex dev`) |
| `npm run seed` | Load the bundled content into Convex |
| `npm run test` | Run Vitest unit tests |
| `npm run lint` | Run ESLint |
| `npm run build` | Production build |

## Project layout

```
convex/
  schema.ts            Data model (users, languages, collections, sentences, progress, stats…)
  auth.ts http.ts      Better Auth wiring + user-sync triggers
  lib/                 Pure, unit-tested logic shared with the frontend:
    cloze.ts             tokenizing, answer matching, multiple-choice building
    srs.ts               spaced-repetition scheduler
    scoring.ts           points, levels, streaks
  play.ts              getQueue + submitAnswer (grades, advances SRS, updates stats)
  collections.ts languages.ts stats.ts settings.ts users.ts
  ai.ts                On-demand AI explanations (Convex action → Claude)
  seed.ts seed/data.ts Bundled content + idempotent loader
app/
  pages/               Landing, auth, dashboard, languages, collections, play, review, stats, settings
  components/          PlaySession, ClozeSentence, ProgressRing, CollectionCard, StatBadge
  composables/        useActivePair, useVoice
```

## How spaced repetition works

Each sentence you answer carries an integer `srsLevel`. A correct answer promotes it one level
(longer interval before it's due again); a wrong answer demotes it (shown again soon). Levels map
to mastery tiers, and the top level is "Mastered". The play queue always serves **due reviews
first**, then new sentences in frequency order. See `convex/lib/srs.ts`.

## Adding content

Edit `convex/seed/data.ts` — add languages, pairs, collections, or sentences (each sentence needs
its `clozeWord` to appear verbatim in the text, a translation, and three distractors), then run
`npm run seed`. The loader is idempotent and only inserts what's missing.
