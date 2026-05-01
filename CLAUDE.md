# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173

# Build & Type checking
npm run build        # tsc + vite build (runs type-check first)
npm run type-check   # TypeScript check without emitting

# Testing
npm test             # Run vitest (watch mode)
npm run test:ui      # Vitest with browser UI
npm run test:coverage

# Linting & Formatting
npm run lint         # ESLint (zero warnings allowed — --max-warnings 0)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check (used in CI)
```

To run a single test file:
```bash
npx vitest run src/store/__tests__/store.test.ts
```

Husky pre-commit hook runs lint-staged (ESLint + Prettier) on staged `.ts/.tsx/.css/.json` files automatically.

## Architecture

**Stack:** React 18 + TypeScript + Vite, with React Router v6, Zustand, React Hook Form + Zod, Recharts, Framer Motion, `@tanstack/react-virtual`.

**Path alias:** `@/` maps to `src/` (configured in [vite.config.ts](vite.config.ts)).

**Base path:** Controlled by `VITE_BASE_PATH` env var (defaults to `/`). The production deployment uses `/money/` as base path.

### State Management

All app state lives in a single Zustand store at [src/store/index.ts](src/store/index.ts) (`useBudgetStore`). It uses the `persist` middleware to sync to `localStorage` under the key `budget-storage`. The store holds `transactions[]` and `categories[]` with CRUD operations and derived selectors (`getBalance`, `getTransactionsByType`, `getTransactionsByDateRange`).

### Data Model

Defined in [src/types/index.ts](src/types/index.ts):
- `Transaction`: `{ id, type: 'income'|'expense', amount, category, date (ISO), comment?, isApproximate? }`
- `Category`: `{ id, name, color, icon (emoji), isQuickAccess?, limit? }`
- `UserSettings`: `{ theme: 'light'|'dark'|'system', currency, enableSound }`

Category names are used as foreign keys — `transaction.category` stores the category name string, not the id.

### Routing

Pages are lazy-loaded via `React.lazy` in [src/App.tsx](src/App.tsx). Routes: `/` (Dashboard), `/add`, `/history`, `/analytics`, `/settings`. All wrapped in `<ErrorBoundary>` and `<Layout>`.

### Pages

- **Dashboard** (`/`): Balance card, quick-add buttons (income/expense), quick-expense feature (for forgotten/approximate purchases), quick-access category presets, and three Recharts charts (pie by category, bar by month, line balance over time).
- **AddTransaction** (`/add`): Full form using `TransactionFormNew` component.
- **History** (`/history`): Virtualized transaction list using `@tanstack/react-virtual` (item height `72px`, overscan `5`).
- **Analytics** (`/analytics`): Detailed charts and breakdowns.
- **Settings** (`/settings`): Theme toggle, currency selection, data export/import, clear data.

### UI Components

Reusable primitives in [src/components/ui/](src/components/ui/): `Button`, `Card`, `Input`, `Select`, `Toast`, `Drawer`. All use CSS Modules and are re-exported from [src/components/ui/index.ts](src/components/ui/index.ts).

`Toast` notifications use the `useToast` hook ([src/hooks/useToast.ts](src/hooks/useToast.ts)) — the `ToastContainer` is rendered at the App root level.

### Theming

CSS custom properties defined in [src/styles/variables.css](src/styles/variables.css) implement a Material Design 3–inspired token system (`--color-*`, `--spacing-*`, `--elevation-*`, `--surface-container-*`). Theme is applied via `data-theme` attribute on `<html>` (`light` | `dark`; omit for system). The `applyTheme` / `getStoredTheme` / `setStoredTheme` utilities in [src/utils/theme.ts](src/utils/theme.ts) manage this. Theme preference is stored in `localStorage` under key `theme`.

### Constants

All magic values live in [src/constants/index.ts](src/constants/index.ts): `STORAGE_KEYS`, `CURRENCIES`, `ROUTES`, `TRANSACTION_TYPES`, `VIRTUALIZATION` sizes, `LIMITS`.

### Data Export

[src/utils/dataExport.ts](src/utils/dataExport.ts) provides `exportToJSON`, `exportToCSV`, `importFromJSON`, and `downloadFile` helpers used from the Settings page.

### Debugging

[src/utils/debugLogger.ts](src/utils/debugLogger.ts) provides a conditional logger — active only in dev mode (`import.meta.env.DEV`).

### Testing

Tests co-locate under `__tests__` directories (e.g. [src/store/__tests__/store.test.ts](src/store/__tests__/store.test.ts)). Vitest runs in `jsdom` environment with globals enabled. Test setup at [src/test/setup.ts](src/test/setup.ts). Tests interact directly with the Zustand store via `useBudgetStore.getState()` and call `clearAllData()` in `beforeEach`.
