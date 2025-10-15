# 🐟 Koi Auction Backend

A robust **TypeScript + Express + TypeORM** backend for managing koi fish auctions — including authentication, CSV/XLSX imports, S3 media uploads, and automated job scheduling.  
Built for performance, maintainability, and flexibility.

---

## 📦 Tech Stack

| Category            | Technology                       |
| ------------------- | -------------------------------- |
| **Language**        | TypeScript                       |
| **Framework**       | Express.js                       |
| **ORM**             | TypeORM                          |
| **Database**        | MySQL                            |
| **Storage**         | AWS S3                           |
| **Auth**            | JWT (JSON Web Token)             |
| **Validation**      | class-validator                  |
| **Scheduling**      | node-schedule                    |
| **Realtime**        | Socket.io                        |
| **Testing**         | Jest + Supertest                 |
| **Linting**         | ESLint (Airbnb rules) + Prettier |
| **Package Manager** | pnpm                             |

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone git@github.com:whysofail/koi-auction.git
cd koi-auction
```

### 2️⃣ Install dependencies

```bash
pnpm install
```

> **Note:** bcrypt is marked as ignored for pnpm postinstall builds (see `pnpm.ignoredBuiltDependencies`).

### 3️⃣ Environment setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in your environment variables (example):

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=koi_auction

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=koi-auction-bucket

# JWT
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development
```

---

## 🧱 Project Structure

```
src/
 ├── config/           # TypeORM data source, env configs
 ├── controllers/      # Express controllers (API layer)
 ├── entities/         # TypeORM entities (database models)
 ├── repositories/     # Data access logic
 ├── services/         # Business logic
 ├── seeders/          # Seed and test data
 ├── middlewares/      # Auth, validation, error handling
 ├── utils/            # Helpers, formatters, etc.
 ├── migrations/       # Database migrations
 ├── main.ts           # Entry point
```

---

## ⚙️ Common Commands

### 🧩 Development

Run in development mode (auto-restart with `nodemon`):

```bash
pnpm start:dev
```

### 🧱 Database (TypeORM)

| Command                 | Description                 |
| ----------------------- | --------------------------- |
| `pnpm db:generate`      | Generate new migration file |
| `pnpm db:migrate`       | Run migrations              |
| `pnpm db:show`          | Show all migrations         |
| `pnpm db:drop`          | Drop the database schema    |
| `pnpm db:seed`          | Run seed data script        |
| `pnpm migration:create` | Create a blank migration    |
| `pnpm migration:run`    | Run pending migrations      |
| `pnpm migration:revert` | Revert last migration       |
| `pnpm schema:drop`      | Drop schema                 |
| `pnpm schema:sync`      | Sync database schema        |

---

## 🧪 Testing

Run unit tests:

```bash
pnpm test
```

Run E2E tests:

```bash
pnpm test:e2e
```

Watch mode:

```bash
pnpm test:watch
```

---

## 🧹 Code Quality

Lint all files:

```bash
pnpm lint
```

Prettier + ESLint are also auto-run on commit using **Husky** + **lint-staged**.

---

## 💡 Conventions

- **Entities → Services → Controllers** pattern for clarity.
- **Airbnb ESLint rules** enforced.
- **No non-null assertions (`!`)** in TypeScript.
- **Dynamic pagination, filtering, and sorting** supported in repositories.
- **Environment-based config** handled in `src/config`.

---
