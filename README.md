# Janta Medicare

Welcome to the **Janta Medicare** monorepo! This repository contains the source code for the Janta Medicare web platform, which includes a modern frontend built with Next.js, and a Supabase backend for database and authentication.

## 🏗 Architecture

The project is structured as a monorepo containing multiple apps and packages:

- **`apps/frontend`**: The main Next.js web application. It handles the user interface, localization (`next-intl`), and forms. Deployed to **Cloudflare Pages**.
- **`apps/backend`**: Backend worker services (deployed to Railway).
- **`apps/health`**: Health check services.
- **`tests`**: End-to-End and Integration testing suites using Playwright and Vitest.
- **`supabase`**: Local database schema, migrations, and Edge Functions.

## 🚀 Getting Started Locally

To run this project locally, you will need **Node.js (v20+)** and **Docker** installed.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Local Supabase Database

Ensure Docker is running, then start the Supabase containers:

```bash
npx supabase start
```

_(This will automatically apply all database migrations found in `supabase/migrations`)_

### 3. Run the Frontend Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing

We take quality seriously! We use Playwright for End-to-End testing and Vitest for Integration testing.

- **Run all E2E Tests**:
  ```bash
  npm run test:e2e
  ```
- **Run Smoke Tests**:
  ```bash
  npm run test:smoke
  ```
- **Run Integration Tests** _(requires valid Supabase connection strings in `.env`)_:
  ```bash
  npm run test:integration
  ```

## 🤝 Contributing

Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) guide for details on our code of conduct, and the process for submitting pull requests to us.
