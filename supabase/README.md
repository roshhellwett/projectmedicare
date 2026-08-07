# Supabase Local Development

This directory contains the database schema, migrations, and seed data for **Janta Medicare**.

## Directory Structure

- `migrations/`: Contains all SQL migrations that define the database schema (tables, RLS policies, enums).
- `config.toml`: The configuration file for the local Supabase instance (ports, auth, buckets).
- `seed.sql`: Contains robust fake Indian data (stores, doctors, products, offers) that is automatically inserted into the database upon reset.

## Commands

### Start Local Supabase

```bash
npx supabase start
```

### Reset Local Database

This will drop everything, re-run all migrations in order, and finally run `seed.sql` to populate fake data.

```bash
npx supabase db reset
```

### Push Migrations to Remote

If you make changes to the local schema, you can push them to the production remote server using:

```bash
npx supabase db push
```

_(Requires the project to be linked via `npx supabase link`)_
