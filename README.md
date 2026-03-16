# train.me-front

Frontend for the Train.me personal training platform.

## Stack

- **Vite** — Build tool and dev server with hot module replacement for fast development
- **React 19** — UI library for building component-based interfaces
- **TypeScript** — Adds static typing to JavaScript for better tooling and fewer runtime errors
- **TailwindCSS v4** — Utility-first CSS framework for styling directly in markup
- **React Router v7** — Client-side routing for navigating between pages without full reloads
- **TanStack Query v5** — Data fetching and caching library for managing server state (API calls)
- **Lucide React** — Icon library with consistent, lightweight SVG icons

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:3000` (the NestJS backend).

## Project structure

```
src/
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── layouts/      # Page layout wrappers
├── lib/          # Utilities and API helpers
├── pages/        # Route-level page components
└── assets/       # Static assets (images, SVGs)
```
