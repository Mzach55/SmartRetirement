# RetireWise Client

The RetireWise client is a React and TypeScript participant portal backed by
`SmartRetirement.Api`. It includes participant selection, dashboards, plan
details, contribution entry, and profile editing.

See the [root README](../README.md) for the product overview and the
[API README](../SmartRetirement.Api/README.md) for backend details.

## Client architecture

```text
Route page
  → feature query or mutation hook
  → typed API function and runtime response parser
  → ASP.NET Core API
```

- React Router owns participant and plan identity through URL parameters.
- TanStack Query owns API data, caching, retries, and mutation refreshes.
- Form components own unsaved input.
- Pure helpers calculate balances and contribution capacity.
- Shared UI components provide consistent feedback and accessibility behavior.

## Run locally

Start the API at `http://localhost:5045`, then run:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Vite forwards relative `/api` requests to the local API. Machine-specific
overrides can be placed in `.env.local` using `.env.example` as a template:

```text
VITE_API_BASE_URL=
DEV_API_TARGET=http://localhost:5045
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build the client |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run frontend tests once |
| `npm run test:watch` | Run tests while editing |
| `npm run check` | Run lint, tests, type-checking, and build |

## Routes

| Route | Page |
| --- | --- |
| `/` | Demo participant chooser |
| `/participants/:participantId` | Dashboard |
| `/participants/:participantId/plans` | Plan list |
| `/participants/:participantId/plans/:planId` | Plan details and history |
| `/participants/:participantId/plans/:planId/contribute` | Contribution form |
| `/participants/:participantId/profile` | Participant profile |

Route IDs are validated, and a plan is displayed only when it belongs to the
participant identified by the URL.

## Source structure

```text
src/api/            Typed HTTP functions, errors, and runtime parsers
src/app/            Providers, routes, navigation effects, error boundary
src/components/     Shared layout and UI components
src/features/       Participant, plan, contribution, and dashboard features
src/lib/            Financial, formatting, and route helpers
src/query/          Query client policy and key factories
src/routes/         Page-level data and navigation orchestration
src/test/           Shared test setup and fixtures
src/types/          API contracts
```

## Important behavior

The contribution preview is advisory. The API performs the final annual-limit
check, and a rejected request preserves the user's draft. Successful
contributions refresh the plan, history, and dashboard data. Successful profile
updates refresh both the participant shell and chooser.

Expected API failures remain page state with retry or correction options.
Unexpected rendering failures are handled by the application error boundary.

## Testing

The Vitest and Testing Library suite covers financial calculations, route
parsing, runtime API contracts, form validation, user interactions, pending
states, and unexpected-error recovery.

Run the complete client quality gate before committing:

```bash
npm run check
```

Detailed design and learning notes remain under [`docs/client`](../docs/client/),
including the [state inventory](../docs/client/state-inventory.md),
[server-state guide](../docs/client/server-state.md), and
[demo guide](../docs/client/demo-readiness.md).
