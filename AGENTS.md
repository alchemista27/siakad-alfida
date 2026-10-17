# SIM-Alfida

Sebuah sistem informasi manajemen pegawai, karyawan serta tenaga penagar di lingkungan Yayasan Alfida

This file gives AI coding agents the context they need to work effectively in this repository. It is read by [Codex](https://openai.com/codex), [Cursor](https://cursor.com), [Sourcegraph Amp](https://ampcode.com), [Aider](https://aider.chat), [Jules](https://jules.google), and other agents that follow the [AGENTS.md spec](https://agents.md).

## Stack

- **Monorepo**: Turborepo (pnpm workspaces)
- **Frontend**: Next.js (React · App Router) — `apps/web`
- **Backend**: NestJS (REST API) — `apps/api`
- **Auth**: Better Auth — session-based auth via Prisma adapter
- **Database**: PostgreSQL (lokal) — Prisma ORM di `packages/database`
- **Storage**: MinIO (S3-compatible local storage via Docker)
- **Icons**: Material UI Icons (Google) — Never use emojis for icons.

## Setup

- **install**: `pnpm install` (root — installs all workspaces)
- **dev**: `pnpm dev` (starts both web & api concurrently via Turborepo)
- **dev:web**: `pnpm --filter web dev` (frontend only)
- **dev:api**: `pnpm --filter api start:dev` (backend only)
- **build**: `pnpm build` (builds all packages via Turborepo pipeline)
- **lint**: `pnpm lint`
- **test**: `pnpm test`
- **typecheck**: `pnpm --filter web tsc --noEmit && pnpm --filter api tsc --noEmit`

## Code Style

- **TypeScript everywhere** — Use TypeScript for new files. Avoid any — prefer unknown and narrow.
- **ESLint enforced** — Run pnpm lint --fix before committing. Never disable rules without a comment explaining why.
- **Prettier formatting** — Auto-format on save. Don't hand-format.
- **Tailwind CSS** — Use utility classes. Extract to a component when patterns repeat 3+ times.
- **Naming conventions** — kebab-case files, PascalCase components, camelCase variables, SCREAMING_SNAKE for env vars.
- **Sorted imports** — Group external → internal → relative. Path aliases over deep relative imports.

## Monorepo Workspace Rules

- **`apps/web/`** — Hanya berisi kode UI (React Components, Pages, Layouts). TIDAK BOLEH ada import Prisma atau logika bisnis.
- **`apps/api/`** — Hanya berisi kode Backend (NestJS Controllers, Services, Guards). TIDAK BOLEH ada komponen React.
- **`packages/database/`** — Prisma schema, generated client, dan seed scripts. Di-import oleh `apps/api`.
- **`packages/shared/`** — TypeScript interfaces, Zod schemas, dan utility functions. Di-import oleh kedua apps.
- **Komunikasi Frontend ↔ Backend**: Gunakan `fetch()` atau library HTTP client (axios/ky) untuk memanggil REST API NestJS. JANGAN gunakan Server Actions untuk operasi database.

## Testing

- **Vitest for unit tests** — Co-locate *.test.ts with the source file. Cover the happy path and at least one edge case.
- **Playwright for e2e** — E2E specs in tests/e2e. Run pnpm test:e2e.
- **Accessibility checks** — Run automated a11y assertions on critical pages. Manual keyboard test before merging UI changes.

## Security

- **Never commit secrets** — No API keys, tokens, or credentials in code. Use .env.local (gitignored) and .env.example for templates.
- **Validate all external input** — Schema-validate request bodies, URL params, and untrusted JSON with Zod or Valibot.
- **Server-side auth checks** — Every NestJS endpoint must use Guards for authentication AND authorization. Don't rely on client guards. Next.js middleware hanya untuk redirect unauthenticated users. Verifikasi dilakukan via Better Auth session checks.

## Pull Requests & Commits

- **Conventional Commits** — Use feat:, fix:, chore:, etc. Imperative mood, lowercase, no period.
- **Small, focused PRs** — One logical change per PR. Aim for < 400 lines of diff. Split larger work into stacked PRs.
- **Tests with the change** — New behavior gets new tests in the same PR. Bug fixes include a regression test.
- **Run checks before pushing** — Run pnpm lint && pnpm test && pnpm build locally. Don't push red PRs.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
