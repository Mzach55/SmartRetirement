# RetireWise API

The RetireWise API owns the participant, employer, plan, and contribution data
used by the React portal. It uses ASP.NET Core controllers, Entity Framework
Core, and SQLite.

See the [root README](../README.md) for the product overview and complete
full-stack setup.

## Design

```text
Controller → Service → Repository → AppDbContext → SQLite
```

- Controllers handle routing, status codes, and HTTP response translation.
- Services validate requests, enforce business rules, and map DTOs.
- Repositories contain EF Core queries and persistence operations.
- Fluent API configurations define relationships, indexes, precision, and
  delete behavior.

A participant can own multiple plans. A plan belongs to one participant, may
optionally reference an employer, and has many contributions.

## Run the API

From the repository root:

```bash
dotnet restore SmartRetirement.slnx
dotnet build SmartRetirement.slnx
dotnet run --project SmartRetirement.Api --launch-profile http
```

Development endpoints:

- API: `http://localhost:5045`
- OpenAPI JSON: `http://localhost:5045/openapi/v1.json`
- Optional HTTPS profile: `https://localhost:7046`

Development startup applies pending migrations and inserts missing sample data.

## Route groups

| Resource | Routes |
| --- | --- |
| Participants | `/api/participants`, `/api/participants/{participantId}` |
| Plans | `/api/plans`, `/api/plans/{planId}` |
| Participant plans | `/api/participants/{participantId}/plans` |
| Employer plans | `/api/employers/{employerId}/plans` |
| Contributions | `/api/contributions`, `/api/contributions/{contributionId}` |
| Plan contributions | `/api/plans/{planId}/contributions` |

Participants and plans support the appropriate GET, POST, PUT, and DELETE
operations. Contributions are append-only in the current participant workflow.

## Contribution-limit rule

When creating a contribution, `ContributionService`:

1. validates the request and destination plan;
2. rejects inactive plans;
3. totals contributions for the same plan and tax year;
4. rejects a projected total above the plan's annual limit;
5. otherwise inserts the contribution and updates the plan balance in one save.

An excessive request returns `409 Conflict` with the Problem Details code
`AnnualLimitExceeded`.

Other expected service codes are `Validation`, `NotFound`, `Conflict`, and
`PlanInactive`. Clients should use these codes instead of parsing error text.

## Database and migrations

The development database is `SmartRetirement.Api/Retirewise.db`. Seed changes
and successful contribution/profile updates persist between restarts.

To restore the original seed, stop the API and remove only that file. The next
Development startup recreates and reseeds it. This discards local demo changes.

Useful migration commands:

```bash
dotnet ef migrations list --project SmartRetirement.Api
dotnet ef migrations add DescriptiveName --project SmartRetirement.Api
dotnet ef database update --project SmartRetirement.Api
```

Review generated `Up`, `Down`, and model-snapshot changes before committing a
migration.

## Project structure

```text
Configurations/     EF Core Fluent API mappings
Controllers/        HTTP endpoints
Data/               AppDbContext and development seeder
DTOs/               Request and response contracts
Migrations/         Versioned database schema
Models/             Persistence entities
Repositories/       Data-access abstractions and implementations
Services/           Validation and business logic
Program.cs          Dependency injection and request pipeline
```

For complete diagrams, relationship details, and request flows, see
[application-flow.md](../docs/application-flow.md) and
[database-schema.md](../docs/database-schema.md).
