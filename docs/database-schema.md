# RetireWise Database Schema

The EF Core model contains four SQLite tables.

## Relationships and columns

```mermaid
erDiagram
    PARTICIPANT ||--o{ PLAN : owns
    EMPLOYER o|--o{ PLAN : sponsors
    PLAN ||--o{ CONTRIBUTION : receives

    PARTICIPANT {
        int Id PK
        string FirstName
        string LastName
        string Email UK
        date DateOfBirth
        datetime CreatedAtUtc
    }

    EMPLOYER {
        int Id PK
        string Name
        string Industry nullable
    }

    PLAN {
        int Id PK
        int ParticipantId FK
        int EmployerId FK nullable
        string Name
        string Type
        date OpenedOn
        decimal CurrentBalance
        decimal AnnualContributionLimit
        bool IsActive
    }

    CONTRIBUTION {
        int Id PK
        int PlanId FK
        decimal Amount
        date ContributionDate
        int TaxYear
        string Description nullable
    }
```

A plan is a participant-owned account, not a shared employer offering.
Employer sponsorship is optional per plan; every contribution belongs to one
plan.

## Constraints

| Area | Rule |
| --- | --- |
| Participant | Names are required and limited to 100 characters; email is required, limited to 256, and unique |
| Employer | Name is required and limited to 200 characters; industry is optional and limited to 100 |
| Plan | Name is required and limited to 200; type is stored as text; monetary fields use precision `18,2` |
| Contribution | Amount uses precision `18,2`; description is optional and limited to 500 characters |
| Participant deletion | Restricted while owned plans exist |
| Employer deletion | Sets `Plan.EmployerId` to null |
| Plan deletion | Restricted while contributions exist |

Service validation enforces positive monetary values and identifiers, valid
dates, valid plan types, inactive-plan behavior, and annual limits before
persistence.

## Indexes

| Index | Purpose |
| --- | --- |
| Unique `Participants.Email` | Final email-uniqueness safeguard |
| `Plans.ParticipantId` | Participant plan lookup |
| `Plans.EmployerId` | Employer plan lookup |
| `Contributions(PlanId, TaxYear)` | Annual contribution total |

## Plan types

The database stores enum names rather than numeric values:

| Name | API value |
| --- | ---: |
| `K401` | 1 |
| `IRA` | 2 |
| `HSA` | 3 |
| `Education529` | 4 |
| `Able` | 5 |

`Unknown` (0) is a rejected sentinel. Renaming an enum member requires a data
migration.

## Migrations

The development database is `SmartRetirement.Api/Retirewise.db`. Development
startup applies pending migrations and inserts missing demo data. Other
environments must apply migrations separately.

```bash
dotnet ef migrations list --project SmartRetirement.Api
dotnet ef migrations add DescriptiveName --project SmartRetirement.Api
dotnet ef database update --project SmartRetirement.Api
```

Review generated migration and snapshot changes before committing them. SQLite
stores `DateOnly`, `DateTime`, and decimal values as `TEXT`, and booleans as
`INTEGER`; EF configuration carries the intended relational constraints.
