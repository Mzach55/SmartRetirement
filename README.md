# RetireWise

RetireWise is a full-stack participant portal for retirement and
tax-advantaged savings plans. Participants can review employer-sponsored and
individual accounts, track annual contributions, submit a contribution, and
update their profile.

The project is an interview-focused demonstration of the architecture used by
plan-administration platforms supporting 401(k), IRA, HSA, 529, and ABLE
accounts.

> This is an educational project. Its sample data and limits are not financial,
> tax, or legal guidance.

## Features

- Demo participant selection without pretending authentication exists
- Combined balance and plan summaries
- Employer-sponsored and individual plans
- Contribution history and tax-year filtering
- Annual-limit usage and remaining-capacity calculations
- Server-enforced contribution-limit validation
- Contribution entry with structured error handling
- Editable participant profiles
- Loading, empty, retry, not-found, and unexpected-error states
- Responsive, keyboard-aware React interface

## Technology

| Backend | Client |
| --- | --- |
| ASP.NET Core 10 Web API | React 19 and TypeScript |
| Entity Framework Core 10 | Vite 8 |
| SQLite | React Router 8 |
| Controllers, services, repositories | TanStack Query 5 |
| Problem Details errors | Vitest and Testing Library |

## Architecture

```text
React client
  → typed HTTP boundary
  → ASP.NET Core controller
  → service layer and business rules
  → repository layer
  → EF Core AppDbContext
  → SQLite
```

The API remains authoritative for business decisions. For example, the client
can preview a contribution, but `ContributionService` recalculates the annual
total and returns `409 AnnualLimitExceeded` when the contribution would exceed
the plan's configured cap.

## Run locally

Prerequisites: .NET 10 SDK, Node.js `^20.19.0` or `>=22.12.0`, and npm.

Clone and install dependencies:

```bash
git clone git@github.com:Mzach55/SmartRetirement.git
cd SmartRetirement
dotnet restore SmartRetirement.slnx
cd smartretirement.client
npm ci
cd ..
```

Start the API in one terminal:

```bash
dotnet run --project SmartRetirement.Api --launch-profile http
```

Start the client in another:

```bash
cd smartretirement.client
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The client
proxies `/api` requests to the API at `http://localhost:5045`.

## Demo path

1. Choose Maya Chen.
2. Compare her employer-sponsored 401(k) and individual IRA.
3. Open the 401(k) and review its 2025 contribution history.
4. Propose an amount that exceeds the displayed annual capacity and show the
   API's `409 AnnualLimitExceeded` response.
5. Submit a valid amount and show the refreshed balance and history.
6. Update Maya's profile and show the refreshed participant identity.

Demo writes persist in `SmartRetirement.Api/Retirewise.db`. To restore the
original seed, stop the API and remove only that database file before restarting.

## Validate

```bash
dotnet build SmartRetirement.slnx
cd smartretirement.client
npm run check
```

`npm run check` runs linting, frontend tests, TypeScript compilation, and the
production build.

## Repository structure

```text
SmartRetirement.Api/        ASP.NET Core API and SQLite persistence
smartretirement.client/     React participant portal
docs/                       Architecture, schema, workflows, and quizzes
SmartRetirement.slnx        .NET solution
```

## Current scope

RetireWise is ready as a local full-stack demonstration. Authentication,
participant authorization, audited contribution corrections, authoritative IRS
limit synchronization, production concurrency controls, backend automated
tests, and deployment automation remain outside the current scope.

## Documentation

- [API setup and reference](SmartRetirement.Api/README.md)
- [Client setup and architecture](smartretirement.client/README.md)
- [Documentation index](docs/README.md)
- [Backend workflows](docs/application-flow.md)
- [Database schema](docs/database-schema.md)
- [Client demo guide](docs/client/demo-readiness.md)
- [Interactive backend, frontend, and full-stack quizzes](docs/quizzes/index.html)
