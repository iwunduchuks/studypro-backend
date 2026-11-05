# Copilot Instructions — StudyPro Backend

This is a Node.js, TypeScript, and Express API organized around Domain-Driven
Design (DDD). Use the existing `src/domain/`, `src/application/`,
`src/infrastructure/`, and `src/interface/` boundaries as described below.
The boundaries are about responsibility and dependency direction, not just
folder names.

## DDD and the layers

DDD is an approach to modeling software around the business domain and its
language. Keep names and rules aligned with the concepts used by the business.
Layers help isolate that model from use-case coordination, delivery mechanisms,
and technology choices. They do not, by themselves, make an application DDD;
use modeling patterns such as aggregates and value objects where they clarify
real domain rules, not as boilerplate for every CRUD operation.

### `domain/` — business model and rules

- Represent domain concepts and enforce business invariants here. Entities
  have identity; value objects represent concepts defined by their values.
  Use aggregates to define consistency boundaries, with aggregate roots
  protecting invariants when the domain needs them.
- Put domain behavior on the relevant domain object when it belongs to that
  concept. Use a domain service only for domain behavior that does not
  naturally belong to one entity or value object.
- Keep the domain independent of Express, Prisma, database schemas, HTTP
  request/response types, and external SDKs. Domain objects should not need
  to know how they are stored or delivered.
- Keep domain-facing repository contracts in `domain/repositories/`, following
  the existing `UserRepository` pattern. These contracts describe operations
  in domain terms, not ORM methods or table access.

### `application/` — use cases and orchestration

- Implement the actions the system offers, such as registering a user or
  retrieving one. An application service/use case coordinates domain objects,
  repository contracts, transactions, and other required ports.
- Keep this layer thin: it controls the workflow but delegates business
  decisions and invariants to the domain. It must not become a second domain
  model or contain Express handlers, Prisma queries, or HTTP response logic.
- Define application-specific input/output types and ports here when they
  belong to a use case rather than to the domain.

### `infrastructure/` — technical adapters

- Implement persistence and external-system details here: repository
  implementations, database/ORM access, and adapters for external services.
- Translate between database or provider representations and domain or
  application types at this boundary. Do not expose ORM models or SDK types
  as domain concepts.
- Infrastructure may depend on domain/application contracts; those layers
  must not depend on infrastructure implementations.
- Current example: `infrastructure/inMemory/inMemoryUserRepo.ts` implements
  the domain's `UserRepository` contract.

### `interface/` — delivery and presentation adapters

- This is the inbound interface (often called the presentation layer in DDD
  references). HTTP routers, controllers, and Express middleware belong in
  `interface/http/`. Other delivery mechanisms can have their own adapters.
- Translate transport input into application calls and map results/errors to
  HTTP status codes and response shapes. Keep HTTP concerns here; do not put
  business rules or persistence queries in controllers and routers.
- Controllers are plain functions, not classes: one standard Express
  `(req, res)` function per endpoint (e.g. `loginController`), grouped by
  resource in files such as `controller/authController.ts`. The services a
  controller needs are instantiated once at module level, after the imports
  and before the functions (e.g. `const authService = new AuthService(...)`),
  and the controller functions use them directly. Do not use classes or
  handler factories for controllers.
- Middleware follows the same pattern as controllers: plain Express
  `(req, res, next)` functions, with any services instantiated once at module
  level after the imports (e.g. `authMiddleware.ts`). No handler factories.
- Routers only declare routes and pass the controller functions directly
  (`router.post("/login", loginController)`); export the router as the
  default export and mount it in `app.ts`. Routers must not instantiate
  services or repositories.

## Dependency direction and request flow

The domain is the center and has no dependency on the outer layers. A typical
request flows inward and its result flows back outward:

`HTTP request → interface controller/router → application use case → domain`

The use case accesses data through a repository/port contract. An infrastructure
adapter implements that contract, and the controller module wires the adapter
into the use case at module level:

`interface → application → domain ← infrastructure`

The source-code dependency points inward toward domain abstractions. The
controller module is the deliberate place in `interface/` that knows both the
abstractions and their concrete implementations. Do not add a direct `domain` → `application`,
`infrastructure`, or `interface` dependency. Keep the domain model and its
business rules independent of HTTP and storage technologies.

For a simple read-only query, a dedicated query adapter can be appropriate
when it avoids distorting the domain model; keep that choice explicit and do
not let it bypass domain invariants for writes. Avoid adding repositories,
services, DTO layers, or abstractions that do not solve an actual boundary or
domain need.

## Project conventions

- Source is TypeScript. Filenames use `camelCase`; classes, interfaces, and
  types use `PascalCase`; functions and variables use `camelCase`.
- Use descriptive names grounded in the domain language. Repository
  implementations should make their backing technology clear (for example,
  `InMemoryUserRepository`); do not impose a Prisma-specific naming rule on
  other adapters.
- Follow the existing import and formatting conventions in the files you
  touch. TypeScript uses NodeNext module resolution; do not change module or
  import conventions without checking the package/module configuration.
- Keep helpers that are framework- and domain-independent in `src/utils/`.
  Keep external client setup in `src/lib/`; do not put business logic there.
- Preserve the current API behavior and response shape when changing
  internals. Update directly related documentation when behavior or
  conventions change.

## Validation

- Use the smallest relevant test or check available. `npm run build` is the
  project build command; it generates the Prisma client and runs TypeScript.
- `npm test` is currently a placeholder, not an automated test suite. Do not
  claim tests passed unless a real test suite was run.
- Do not run scripts that call real external services without confirming with
  the user first.

## Further reading

- [Microsoft Learn: Designing a DDD-oriented microservice](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice) — explains domain, application, and infrastructure responsibilities and their dependency direction. Its examples use .NET, but the concepts apply here.
- [Microsoft Learn: Designing the infrastructure persistence layer](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design) — explains repository abstractions and persistence adapters.
- [Domain Language: Domain-Driven Design](https://domainlanguage.com/ddd/) — Eric Evans's foundational DDD book and resources.
