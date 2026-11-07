### Getting Started (Development)

1. Click **Use this template** on GitHub to create your repository, then clone it

```bash
git clone <your-repository-url>
cd <your-repository-name>
```

2. Install dependencies

```bash
npm i
```

3. Generate the Prisma client

```bash
npx prisma generate
```

4. Create a `.env` file in the project root and set `DATABASE_URL` (used by `prisma.config.ts`)

5. Start the development server (watch mode)

```bash
npm run dev
```

### Scripts

1. Migrate database to new prisma schema in development mode

```bash
npx prisma migrate dev --name comment_here
```

2. Generate new prisma client types from updated schema

```bash
npx prisma generate
```

3. Migrate database to current schema level in production
   This code should be part of build command run before typescript build

```bash
npx prisma migrate deploy
```

4. Rollback failed migrations in production

```bash
npx prisma migrate resolve --rolled-back 20260107203754_your_migration
```

5. Reset database including data

```bash
npx prisma migrate reset
```

6. Run script.ts

```bash
npx tsx src/script.ts

```

### Topic endpoints

These endpoints require a bearer token obtained from `POST /api/auth/login`.
Successful responses use the standard `success`, `message`, and `data` envelope.

- `GET /topic` lists topics.
- `GET /topic/:id` retrieves a topic.
- `POST /topic` creates a topic from `{ "context": "..." }`.
- `PUT /topic/:id` updates its title with `{ "title": "..." }`.
- `DELETE /topic/:id` removes the topic and its contexts.

Creation returns HTTP 201; missing topics return 404, and missing or blank
context or title values return 400.
