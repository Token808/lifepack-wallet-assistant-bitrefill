# Web App

This package is the Vite + React demo app for the Wallet UI Starter Kit. It shows
how to compose wallet screens with shared components from `@repo/ui`.

## Structure

```text
src/
├── app/                  # App shell, providers, and router setup
├── pages/                # Route-level page components
├── features/             # Feature modules
│   └── wallet/           # Starter wallet dashboard and mock data
├── hooks/                # App-level hooks
├── stores/               # App-level state stores
├── lib/                  # App-level utilities
└── main.tsx              # Imports globals.css once and mounts React
```

## Routes

- `/` renders the starter wallet dashboard.
- `/ui-kit` renders a lightweight gallery of common shared wallet UI components.
  It is not exhaustive; browse `packages/ui/src/components` for the full source.

## Development

Run the app from the repository root:

```bash
pnpm dev
```

Useful package-level commands:

```bash
pnpm --filter @repo/web test
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
```

Before changing UI details, read the root `DESIGN.md` and prefer existing
components from `@repo/ui/components/*`.
