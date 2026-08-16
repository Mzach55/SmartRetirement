# RetireWise Application Flow

This document shows how the currently implemented backend layers collaborate.
The models, EF Core configuration, repositories, DTOs, services, and dependency
injection registrations exist today. Custom REST controllers are intentionally
shown as the next boundary because they belong to Topic 5 and have not yet been
implemented.

## Layered architecture

```mermaid
flowchart LR
    Client["RetireWise client or API caller"]
    Pipeline["ASP.NET Core request pipeline"]
    Controllers["REST controllers<br/>Topic 5: not implemented yet"]

    subgraph Application["Application layer"]
        ServiceInterfaces["Service interfaces"]
        Services["ParticipantService<br/>PlanService<br/>ContributionService"]
        DTOs["Request and response DTOs<br/>ServiceResult and ServiceError"]
    end

    subgraph Persistence["Persistence layer"]
        RepositoryInterfaces["Repository interfaces"]
        Repositories["Generic and entity-specific repositories"]
        Context["AppDbContext<br/>EF Core change tracker"]
        SQLite[("SQLite database")]
    end

    Client --> Pipeline
    Pipeline -. "will dispatch to" .-> Controllers
    Controllers -. "will depend only on" .-> ServiceInterfaces
    ServiceInterfaces --> Services
    Services --> DTOs
    Services --> RepositoryInterfaces
    RepositoryInterfaces --> Repositories
    Repositories --> Context
    Context --> SQLite
```

The arrows represent allowed dependencies. Controllers should not skip the
service layer to call repositories or `AppDbContext`. Repositories should not
contain annual-limit rules or HTTP behavior.

## Service dependency graph

```mermaid
flowchart TB
    subgraph ServiceLayer["Service layer"]
        ParticipantService
        PlanService
        ContributionService
    end

    subgraph Contracts["Repository contracts"]
        IParticipantRepository
        IEmployerRepository
        IPlanRepository
        IContributionRepository
        Generic["IRepository&lt;T&gt;"]
    end

    ParticipantService --> IParticipantRepository

    PlanService --> IPlanRepository
    PlanService --> IParticipantRepository
    PlanService --> IEmployerRepository

    ContributionService --> IContributionRepository
    ContributionService --> IPlanRepository

    IParticipantRepository -- "inherits" --> Generic
    IEmployerRepository -- "inherits" --> Generic
    IPlanRepository -- "inherits" --> Generic
    IContributionRepository -- "inherits" --> Generic
```

Each service receives interfaces through constructor injection. This keeps the
service unaware of EF Core implementation details and allows a different
implementation or test double to satisfy the same contract.

## Dependency injection and scoped lifetime

```mermaid
flowchart TB
    Program["Program.cs registrations"]

    subgraph Scope["One HTTP request / one DI scope"]
        Controller["Future controller instance"]
        Service["Scoped service instance"]
        RepoA["Scoped repository A"]
        RepoB["Scoped repository B"]
        DbContext["One shared scoped AppDbContext"]
        Tracker["Shared EF Core change tracker"]
    end

    Program --> Controller
    Controller --> Service
    Service --> RepoA
    Service --> RepoB
    RepoA --> DbContext
    RepoB --> DbContext
    DbContext --> Tracker
```

The shared scoped context is important for `ContributionService`. The plan
repository can track a balance change while the contribution repository tracks
a new contribution. A single `SaveChangesAsync` commits both pending changes.

## Generic and specific repository flow

```mermaid
flowchart LR
    Service["Service use case"]

    subgraph Specific["Specific repository"]
        Query["Domain-specific query<br/>for example annual total"]
    end

    subgraph Generic["Repository&lt;T&gt;"]
        Common["GetById / GetAll<br/>Add / Update / Remove<br/>SaveChanges"]
        DbSet["protected DbSet&lt;T&gt; _dbSet"]
        Context["protected AppDbContext _context"]
    end

    Database[(SQLite)]

    Service --> Query
    Service --> Common
    Query --> DbSet
    Common --> DbSet
    Common --> Context
    DbSet --> Context
    Context --> Database
```

`protected` allows derived repositories to reuse `_dbSet` and `_context`
without making those fields public to unrelated callers. The generic repository
handles operations shared by every entity. Specific repositories add queries
that only make sense for one entity, such as summing contributions by plan and
tax year.

## Query behavior and tracking

```mermaid
flowchart TD
    Query{What kind of operation?}
    ById["GetByIdAsync / FindAsync"]
    ReadOnly["Read-only list or detail query"]
    Mutation["Add, Update, or Remove"]

    Tracked["Tracked entity<br/>changes can be detected"]
    Untracked["AsNoTracking result<br/>lower tracking overhead"]
    Pending["Entity state changed in memory<br/>not persisted yet"]
    Save["SaveChangesAsync"]
    Database[(SQLite)]

    Query -->|single identity lookup| ById
    Query -->|display/query only| ReadOnly
    Query -->|state change| Mutation
    ById --> Tracked
    ReadOnly --> Untracked
    Mutation --> Pending
    Tracked --> Pending
    Pending --> Save
    Save --> Database
```

`AddAsync`, `Update`, and `Remove` change EF Core's tracked state. They do not
guarantee persistence until `SaveChangesAsync` succeeds.

## Contribution creation and annual-limit rule

```mermaid
sequenceDiagram
    autonumber
    actor Caller
    participant Service as ContributionService
    participant PlanRepo as IPlanRepository
    participant ContributionRepo as IContributionRepository
    participant Context as Shared AppDbContext
    participant DB as SQLite

    Caller->>Service: CreateAsync(request, cancellationToken)
    Service->>Service: Validate ID, amount, date, and tax year
    Service->>PlanRepo: GetByIdAsync(planId)
    PlanRepo->>Context: FindAsync(planId)
    Context->>DB: Query when not already tracked
    DB-->>Context: Plan or no row
    Context-->>PlanRepo: Plan or null
    PlanRepo-->>Service: Plan or null

    alt Plan missing or inactive
        Service-->>Caller: Failed ServiceResult
    else Plan can accept contributions
        Service->>ContributionRepo: GetTotalForPlanAndTaxYearAsync(planId, taxYear)
        ContributionRepo->>DB: SUM amount for matching plan and year
        DB-->>ContributionRepo: Existing annual total
        ContributionRepo-->>Service: Existing annual total
        Service->>Service: projectedTotal = existingTotal + requestedAmount

        alt Projected total exceeds limit
            Service-->>Caller: AnnualLimitExceeded result
        else Projected total is within limit
            Service->>ContributionRepo: AddAsync(new contribution)
            Service->>PlanRepo: Update(plan with increased balance)
            Service->>ContributionRepo: SaveChangesAsync()
            ContributionRepo->>Context: Commit all tracked changes once
            Context->>DB: INSERT contribution and UPDATE plan
            DB-->>Context: Commit succeeds
            Service-->>Caller: Successful ContributionResponse
        end
    end
```

The rule compares the projected total with the stored plan limit:

```text
existing total + requested amount > annual limit  => reject
existing total + requested amount == annual limit => accept
existing total + requested amount < annual limit  => accept
```

Only contributions for the same plan and tax year are included. A rejected
request never calls `AddAsync` or `SaveChangesAsync`.

## Plan-service decision flow

```mermaid
flowchart TD
    Request["Plan service request"] --> Validate["Validate IDs, name, type,<br/>opened date, and annual limit"]
    Validate -->|invalid| ValidationFailure["Validation failure"]
    Validate -->|valid| Operation{Operation}

    Operation -->|Create| ParticipantExists{"Participant exists?"}
    ParticipantExists -->|no| NotFound["NotFound failure"]
    ParticipantExists -->|yes| EmployerNeeded{"EmployerId supplied?"}
    EmployerNeeded -->|yes| EmployerExists{"Employer exists?"}
    EmployerExists -->|no| NotFound
    EmployerExists -->|yes| NewPlan["Create active plan<br/>with zero balance"]
    EmployerNeeded -->|no| NewPlan

    Operation -->|Update| PlanExists{"Plan exists?"}
    PlanExists -->|no| NotFound
    PlanExists -->|yes| UpdateFields["Update allowed metadata<br/>not owner or balance"]

    Operation -->|Delete| Details["Load plan with contributions"]
    Details --> HasHistory{"Has contribution history?"}
    HasHistory -->|yes| Conflict["Conflict: deactivate instead"]
    HasHistory -->|no| Remove["Remove and save"]

    NewPlan --> Save["SaveChangesAsync"]
    UpdateFields --> Save
```

The nullable employer ID permits an individual account. Participant ownership
and current balance are intentionally absent from the update DTO so an ordinary
metadata update cannot transfer an account or rewrite financial state.

## Participant-service decision flow

```mermaid
flowchart TD
    Input["Create or update request"] --> Validate["Validate names, email syntax,<br/>lengths, and date of birth"]
    Validate -->|invalid| Failure["Validation failure"]
    Validate -->|valid| Normalize["Trim names and normalize email"]
    Normalize --> Unique{"Email already used by<br/>another participant?"}
    Unique -->|yes| Conflict["Conflict failure"]
    Unique -->|no| Mode{Create or update?}
    Mode -->|Create| Create["Set CreatedAtUtc on server"]
    Mode -->|Update| Update["Preserve Id and CreatedAtUtc"]
    Create --> Save["SaveChangesAsync"]
    Update --> Save

    Delete["Delete request"] --> LoadPlans["Load participant with plans"]
    LoadPlans --> OwnsPlans{"Owns any plans?"}
    OwnsPlans -->|yes| DeleteConflict["Conflict: deletion rejected"]
    OwnsPlans -->|no| DeleteSave["Remove and save"]
```

The pre-save email check provides a useful business error. The database's
unique index remains the final protection against duplicate values.

## Service result states

```mermaid
stateDiagram-v2
    [*] --> ServiceOperation
    ServiceOperation --> Success: use case completed
    ServiceOperation --> Failure: expected validation or domain problem

    Success: IsSuccess = true
    Success: Value is populated
    Success: Error is null

    Failure: IsSuccess = false
    Failure: Value is null/default
    Failure: Error has code and message

    Success --> [*]
    Failure --> [*]
```

The private `ServiceResult<T>` constructor and public static factory methods
prevent callers from freely constructing contradictory result states. Topic 5
controllers will translate these error codes into HTTP status codes.

## Current boundary and known limitation

The service and persistence layers are registered and compile, but custom
controllers are not implemented yet. Therefore the current architecture is
ready to receive HTTP endpoints, but the client cannot yet invoke these use
cases through REST.

The annual-limit check is also a read-then-write operation. Two concurrent
requests could read the same existing total and both pass before either saves.
A production implementation would study transaction isolation, optimistic
concurrency, or a database-enforced aggregate strategy.
