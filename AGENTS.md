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
pnpm build          # nuxt build
pnpm generate       # static output for the PWA
pnpm preview        # SPA preview of .output/public on :4173 (run `pnpm generate` first)
pnpm test:e2e       # Playwright; auto-runs `pnpm generate` + `pnpm preview`
pnpm test:e2e tests/e2e/static-app.spec.ts         # single e2e file
```

`pnpm preview` runs `scripts/preview.mjs` with the pinned `sirv` dev dependency. It serves client routes from `index.html` and returns 404 for missing assets; set `HOST=0.0.0.0` to bind all interfaces. Do not use `nuxt preview` for the static preset: Nitro writes `npx serve public` into `.output/nitro.json`, and npm 11 rejects this repo's pnpm-only `devEngines`. Do not invoke `npx`/`npm` from scripts.

There is **no lint or format script** and no ESLint/Prettier config. Do not invent one; verify with `pnpm typecheck` and `pnpm test`.

CI (`.github/workflows/build.yml`) runs, in order: `typecheck` → `test:coverage` → `build` → `test:e2e` → SonarQube scan. Playwright runs `pnpm generate` as part of E2E. PRs target `master`; commits follow Conventional Commits.

## Architecture

- `app/domain/` — pure TypeScript, no Vue imports. Each calculator has its calculation module, `validation.ts` (or `secondary-validation.ts`), and persistence type guards. `dough-recipe/calculateDoughRecipe.ts` is the core formula engine; `transitions.ts` handles style/unit/flour-count changes and normalization.
- `app/components/` — thin presentational components; form primitives (`NumberField`, `SelectField`, etc.) use `defineModel`.
- `app/pages/` — one page per calculator; `app/pages/index.vue` hosts the recipe workspace.
- `app/composables/usePersistedCalculatorState.ts` — loads/saves state via `app/services/calculator-state-store.ts` (versioned `localStorage` keys: `dough-calculator:<key>`, currently key `recipe`). The store is injected by `app/plugins/calculator-state.client.ts`.
- `app/utils/format-results.ts` — display formatting/rounding. Domain calculations deliberately keep unrounded intermediates; tests assert with `toBeCloseTo`.

Adding a route requires updating the `nitro.prerender.routes` list in `nuxt.config.ts` (static preset). The service worker is disabled in dev (`pwa.devOptions.enabled: false`); PWA/offline behavior is only verifiable against `pnpm generate` + `pnpm preview` output.

## Testing

- Unit/component tests use Vitest + happy-dom + `@vue/test-utils`; they do not use `@nuxt/test-utils`. `vitest.config.ts` includes `tests/**/*.test.ts`; run a single file with `pnpm test tests/domain/water-temperature.test.ts`.
- E2E tests use `@nuxt/test-utils/playwright` in host mode. The static preset has no `.output/server/index.mjs`, so the default Nuxt Playwright fixture cannot start the app. `playwright.config.ts` sets `use.nuxt.host` to the preview server started by `webServer` (`pnpm generate && pnpm preview`).
- Use `goto(..., { waitUntil: 'hydration' })` for initial navigations. Keep `page.goto` for flows where the service worker or first paint is the behavior under test, and for reloads.
- If a future test needs Nuxt auto-imports, `useNuxtApp`, or `mountSuspended`, add a `defineVitestProject` Nuxt project and `tests/nuxt/**/*.test.ts`. Do not mix Nuxt runtime helpers and E2E helpers in one file.
- Test layout: `tests/{domain,components,composables,plugins}` for Vitest and `tests/e2e` for Playwright. Vitest only includes `.test.ts`; Playwright only `.spec.ts`.

## Conventions and gotchas

- Validation is the single source of truth: persistence type guards call the same `validate*` functions. Disabled fields are excluded by default; pass `{ includeDisabledFields: true }` when validating a whole persisted object. Keep this contract when adding fields.
- Use **relative imports** for app code and test subjects. The Vitest config has no `~`/`@` alias, and components import Vue APIs explicitly rather than relying on Nuxt auto-imports. Test-runner imports (`vitest`, `@vue/test-utils`, `@playwright/test`, `@nuxt/test-utils/playwright`) are package imports and expected. The one exception is `useNuxtApp()`, which unit tests stub with `vi.stubGlobal`.
- Unit tests use Vitest + happy-dom + `@vue/test-utils` and do **not** use `@nuxt/test-utils`. Mount components directly, inject a fake `CalculatorStateStore` via `vi.stubGlobal('useNuxtApp', ...)`, and use `tests/helpers/nuxt-stubs.ts` for `NuxtLink`/`NuxtPage`/`NuxtLayout`. `@nuxt/test-utils` is used only by Playwright in host mode.
- E2E tests select controls by accessible labels/`aria-label` (e.g. `getByLabel('Room fermentation time')`). Renaming a label or result `aria-label` breaks tests; update both together.
- `NumberField` emits `input.valueAsNumber`, so empty/invalid input becomes `NaN`; validation must reject non-finite values.
- UI uses Tailwind CSS v4 with custom breakpoints `below-960`, `below-720`, `below-420` and theme tokens (`paper`, `ink`, `muted`, `line`, `clay`, `olive`, `cream`) defined in `app/assets/css/main.css`. Prefer these over generic `md:`/`lg:` breakpoints.
- `vitest.config.ts` only includes `tests/**/*.test.ts`; Playwright specs live in `tests/e2e/**/*.spec.ts` and are excluded from Vitest. Coverage only counts `app/**/*.{ts,vue}`.
