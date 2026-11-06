# AGENTS.md

Pizza dough calculator: Nuxt 4 SPA (`ssr: false`), fully client-side, built as a static PWA. No backend, API, or server routes (`server/` is empty).

## Commands

Node 26 (`.nvmrc`) and pnpm. `pnpm install` runs `nuxt prepare` via `postinstall`, which generates `.nuxt` and is required before `typecheck`.

```bash
pnpm dev            # Nuxt dev server
pnpm typecheck      # nuxt typecheck (vue-tsc)
pnpm test           # vitest run, all tests
pnpm test tests/domain/water-temperature.test.ts   # single test file
pnpm test:coverage  # v8 coverage -> coverage/lcov.info
pnpm test:e2e       # Playwright; auto-runs `pnpm generate` + preview on :4173
pnpm test:e2e tests/e2e/static-app.spec.ts         # single e2e file
pnpm build          # nuxt build
pnpm generate       # static output for the PWA
```

There is **no lint or format script** and no ESLint/Prettier config. Do not invent one; verify with `pnpm typecheck` and `pnpm test`.

CI (`.github/workflows/build.yml`) runs, in order: `typecheck` → `test:coverage` → `build` → `generate` → SonarQube scan. PRs target `master`; commits follow Conventional Commits.

## Architecture

- `app/domain/` — pure TypeScript, no Vue imports. Each calculator has its calculation module, `validation.ts` (or `secondary-validation.ts`), and persistence type guards. `dough-recipe/calculateDoughRecipe.ts` is the core formula engine; `transitions.ts` handles style/unit/flour-count changes and normalization.
- `app/components/` — thin presentational components; form primitives (`NumberField`, `SelectField`, etc.) use `defineModel`.
- `app/pages/` — one page per calculator; `app/pages/index.vue` hosts the recipe workspace.
- `app/composables/usePersistedCalculatorState.ts` — loads/saves state via `app/services/calculator-state-store.ts` (versioned `localStorage` keys: `dough-calculator:<key>`, currently key `recipe`). The store is injected by `app/plugins/calculator-state.client.ts`.
- `app/utils/format-results.ts` — display formatting/rounding. Domain calculations deliberately keep unrounded intermediates; tests assert with `toBeCloseTo`.

Adding a route requires updating the `nitro.prerender.routes` list in `nuxt.config.ts` (static preset). The service worker is disabled in dev (`pwa.devOptions.enabled: false`); PWA/offline behavior is only verifiable against `pnpm generate`/preview output.

## Conventions and gotchas

- Validation is the single source of truth: persistence type guards call the same `validate*` functions. Disabled fields are excluded by default; pass `{ includeDisabledFields: true }` when validating a whole persisted object. Keep this contract when adding fields.
- Use **relative imports** throughout `app/` and `tests/`. The Vitest config has no `~`/`@` alias, and components import Vue APIs explicitly rather than relying on Nuxt auto-imports. The one exception is `useNuxtApp()`, which tests stub with `vi.stubGlobal`.
- Unit tests use Vitest + happy-dom + `@vue/test-utils`; there is **no `@nuxt/test-utils`**. Mount components directly, inject a fake `CalculatorStateStore` via `vi.stubGlobal('useNuxtApp', ...)`, and use `tests/helpers/nuxt-stubs.ts` for `NuxtLink`/`NuxtPage`/`NuxtLayout`.
- E2E tests select controls by accessible labels/`aria-label` (e.g. `getByLabel('Room fermentation time')`). Renaming a label or result `aria-label` breaks tests; update both together.
- `NumberField` emits `input.valueAsNumber`, so empty/invalid input becomes `NaN`; validation must reject non-finite values.
- UI uses Tailwind CSS v4 with custom breakpoints `below-960`, `below-720`, `below-420` and theme tokens (`paper`, `ink`, `muted`, `line`, `clay`, `olive`, `cream`) defined in `app/assets/css/main.css`. Prefer these over generic `md:`/`lg:` breakpoints.
- `vitest.config.ts` only includes `tests/**/*.test.ts`; Playwright specs live in `tests/e2e/**/*.spec.ts` and are excluded from Vitest. Coverage only counts `app/**/*.{ts,vue}`.
