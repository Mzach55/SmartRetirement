# RetireWise API

The API is the authoritative boundary for participant, plan, employer, and
contribution data. It runs at `http://localhost:5045` with the local HTTP
profile; development OpenAPI JSON is available at
`http://localhost:5045/openapi/v1.json`.

See the [root README](../README.md) for startup instructions.

## Endpoints

| Method | Path | Success |
| --- | --- | --- |
| `GET` | `/api/participants` | `200` participant array |
| `GET` | `/api/participants/{participantId}` | `200` participant |
| `POST` | `/api/participants` | `201` participant |
| `PUT` | `/api/participants/{participantId}` | `200` participant |
| `DELETE` | `/api/participants/{participantId}` | `204` |
| `GET` | `/api/plans` | `200` plan array |
| `GET` | `/api/plans/{planId}` | `200` plan |
| `GET` | `/api/participants/{participantId}/plans` | `200` plan array |
| `GET` | `/api/employers/{employerId}/plans` | `200` plan array |
| `POST` | `/api/plans` | `201` plan |
| `PUT` | `/api/plans/{planId}` | `200` plan |
| `DELETE` | `/api/plans/{planId}` | `204` |
| `GET` | `/api/contributions/{contributionId}` | `200` contribution |
| `GET` | `/api/plans/{planId}/contributions` | `200` contribution array |
| `POST` | `/api/contributions` | `201` contribution |

There is no employer CRUD endpoint. Contributions are append-only through the
HTTP API.

## Contracts

JSON uses camelCase. Calendar dates use `YYYY-MM-DD`, and monetary values are
JSON numbers.

| Request | Fields |
| --- | --- |
| Participant create/update | `firstName`, `lastName`, `email`, `dateOfBirth` |
| Plan create | `participantId`, nullable `employerId`, `name`, `type`, `openedOn`, `annualContributionLimit` |
| Plan update | nullable `employerId`, `name`, `type`, `openedOn`, `annualContributionLimit`, `isActive` |
| Contribution create | `planId`, `amount`, `contributionDate`, `taxYear`, nullable `description` |

Responses add server-owned identifiers and state. Participant responses include
`createdAtUtc`; plan responses include `currentBalance`, `isActive`, and an
optional employer summary.

Plan types are numeric: `1` = 401(k), `2` = IRA, `3` = HSA, `4` = 529,
and `5` = ABLE. `0` is reserved and rejected.

## Errors

Expected failures use Problem Details with a stable `code` extension:

| Status | Codes |
| --- | --- |
| `400` | `Validation` |
| `404` | `NotFound` |
| `409` | `Conflict`, `PlanInactive`, `AnnualLimitExceeded` |

Clients should branch on `status` and `code`, not human-readable
`title` or `detail`.

## Contribution rule

A contribution is accepted only when the plan exists, is active, and:

```text
existing total for plan and tax year + requested amount <= annual limit
```

On success, the contribution insert and plan-balance update are persisted by
one `SaveChangesAsync`. The account balance is not used to calculate annual
contribution capacity.

See [Workflows](../docs/application-flow.md) for request sequences and
[Database Schema](../docs/database-schema.md) for persistence details.
