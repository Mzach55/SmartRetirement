# RetireWise Client

The React client provides participant selection, dashboards, plan details,
contribution entry, and profile editing. See the
[root README](../README.md) for full-stack startup instructions.

## Architecture

```text
route page
  → feature query or mutation
  → typed API function and runtime parser
  → ASP.NET Core API
```

- React Router owns participant and plan identity in the URL.
- TanStack Query owns remote data, request status, retries, and cache refreshes.
- Forms own unsaved input; pure helpers derive financial display values.
- API responses are parsed from `unknown` before entering application state.
- Shared components and CSS Modules provide accessible, responsive UI behavior.

## Configuration

Vite proxies relative `/api` requests to the local API. Copy `.env.example`
to `.env.local` only when an override is needed:

```dotenv
VITE_API_BASE_URL=
DEV_API_TARGET=http://localhost:5045
```

`VITE_API_BASE_URL` is public build-time configuration and must not contain
secrets.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Demo participant chooser |
| `/participants/:participantId` | Dashboard |
| `/participants/:participantId/plans` | Plan list |
| `/participants/:participantId/plans/:planId` | Plan details and history |
| `/participants/:participantId/plans/:planId/contribute` | Contribution form |
| `/participants/:participantId/profile` | Profile form |

Route identifiers must be positive 32-bit integers. Plan pages also verify that
the plan belongs to the participant in the URL.

## State and failure behavior

- Expected API failures remain page or form state; unexpected render failures
  reach the application error boundary.
- The contribution preview is advisory. The API decides whether the write is
  valid, and rejected requests preserve the draft.
- A successful contribution refreshes plan detail, contribution history, and
  the participant's plan list before returning to plan details.
- A successful profile update replaces participant detail and refreshes the
  participant chooser.
- Canceled requests are not shown as user-facing errors; retryable reads expose
  a recovery action.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite |
| `npm run test:watch` | Run tests while editing |
| `npm run check` | Run lint, tests, type-checking, and production build |

Use `npm run check` before committing client changes.
