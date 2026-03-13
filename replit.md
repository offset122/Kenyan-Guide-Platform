# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo React Native (Expo Router, file-based routing)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native mobile app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Mobile App — My Kenyan Guide

A full-featured Kenyan services discovery mobile app built with Expo React Native.

### Features
- Smart search with category filtering and suggestions
- 6 main categories: Service Providers, Businesses, Emergency Services, Job Corner, Marketplace, Real Estate
- Listing cards with ratings, location, badges, price, call buttons
- Detailed listing view with reviews, description, call/message CTAs
- Profile & settings screen with notification/location toggles
- Saved listings tab
- Premium dark green + gold glassmorphism design

### Screens
- `app/(tabs)/index.tsx` — Home screen with hero, search, categories, featured listings
- `app/(tabs)/explore.tsx` — Browse all categories + platform stats
- `app/(tabs)/saved.tsx` — Saved/bookmarked listings
- `app/(tabs)/profile.tsx` — User profile, settings, account menu
- `app/search.tsx` — Full-text search with category filters
- `app/category/[id].tsx` — Category detail with filtered listing list
- `app/listing/[id].tsx` — Full listing detail with CTA bar

### Data
- `constants/data.ts` — All categories and listings (mock data)
- `constants/colors.ts` — Theme: dark green (#0A1A10) + gold (#C9A84C) palette

### Components
- `components/CategoryCard.tsx` — Animated 2-column grid card
- `components/ListingCard.tsx` — Rich listing row card
- `components/SearchBar.tsx` — Unified search input
- `components/ui/Badge.tsx` — Colored status badges
- `components/ui/StarRating.tsx` — Star + rating display

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
