# Dough Notes

A phone-first pizza dough calculator with recipe planning, flour-strength blending, tin-mass estimates, and water-temperature guidance. Calculations run in the browser, and the latest inputs for each calculator are saved locally on the device.

## Development

The project pins pnpm 12.16.1 through `devEngines.packageManager` in `package.json`, and the resolved version is recorded in `pnpm-lock.yaml`. pnpm switches to that version automatically, so installs are reproducible.

```sh
pnpm install
pnpm dev
```

To update pnpm, run `pnpm self-update` and then `pnpm install` to refresh the lockfile.

## Checks

```sh
pnpm typecheck
pnpm test
pnpm test:e2e
```

The Playwright suite builds and serves the generated static app, then checks the routes, local input restoration, and offline calculation. Install Playwright's Chromium once if it is not already available:

```sh
pnpm exec playwright install chromium
```

## Static deployment

```sh
pnpm generate
```

Deploy the contents of `.output/public/` at the site root. The app is client-only and includes prerendered entry files for all calculator routes. The PWA service worker can support offline navigation after an online visit has installed and cached the app; first use still requires connectivity. No server-side calculations or external network services are used.
