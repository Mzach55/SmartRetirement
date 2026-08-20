# RetireWise

RetireWise is a full-stack participant portal for retirement and
tax-advantaged savings plans. Users can review plan balances and contribution
history, submit contributions, and update their profile.

This is an educational demonstration, not financial, tax, or legal guidance.
Authentication, authorization, production concurrency controls, deployment,
and authoritative contribution-limit synchronization are outside its scope.

## Stack

| API | Client |
| --- | --- |
| ASP.NET Core 10, EF Core 10, SQLite | React 19, TypeScript, Vite |
| Controllers, services, repositories | React Router, TanStack Query |
| Problem Details errors | Vitest, Testing Library, CSS Modules |

The API owns validation and business rules; the client provides typed data
access, cached server state, accessible forms, and responsive presentation.

## Run locally

Prerequisites: .NET 10 SDK, Node.js `^20.19.0` or `>=22.12.0`, and npm.

```bash
dotnet restore SmartRetirement.slnx
cd smartretirement.client
npm ci
cd ..
```

From the repository root, start the API:

```bash
dotnet run --project SmartRetirement.Api --launch-profile http
```

In another terminal, start the client:

```bash
cd smartretirement.client
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. Development
requests to `/api` are proxied to `http://localhost:5045`.

The SQLite database persists at `SmartRetirement.Api/Retirewise.db`. To reset
the demo data, stop the API, delete only that file, and restart the API.

## Demo

1. Choose Maya Chen.
2. Review her 401(k), IRA, balances, and 2025 contribution history.
3. Show an over-limit contribution rejection, then submit a valid amount.
4. Update her profile and confirm the refreshed participant identity.

## Verify

```bash
dotnet build SmartRetirement.slnx
cd smartretirement.client
npm run check
```

`npm run check` runs linting, frontend tests, TypeScript compilation, and the
production build.

## Documentation

- [API reference](SmartRetirement.Api/README.md)
- [Client guide](smartretirement.client/README.md)
- [Architecture documentation](docs/README.md)
