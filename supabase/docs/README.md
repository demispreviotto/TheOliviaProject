# 🚀 Supabase Local Infrastructure

This folder contains the database schema, migrations, and configuration for **The Olivia Project**. We use the Supabase CLI + Docker for local development and Supabase Cloud for our LIVE environment.

## 🛠 Prerequisites

- **Docker Desktop**: Must be running.
- **Node.js**: v20 or higher.
- **Supabase CLI**: Installed via npm: 
```bash
npx supabase init
```

---

## 💻 Essential Commands

### 1. Local Development Workflow
*Use this for daily coding and testing new features.*
Run this to spin up all Docker containers (DB, Auth, Studio, etc.).
```bash
npx supabase start --> start local environment and get all the variables and keys on terminal. 
```

### 2. Stop the Environment
Stop all containers without losing local data.
```bash
npx supabase stop
```

### 3. Reset Database (The "Architect" Command)
Warning: This drops the local database and recreates it from scratch using your migration files and `seed.sql`.
```bash
npx supabase db reset
```

### 4. Create a New Migration
Generates a new timestamped SQL file in `supabase/migrations/`.
```bash
npx supabase migration new <migration_name>
```

### 5. Generate TypeScript Types
Syncs your database schema with your frontend types.
```bash
npx supabase gen types typescript --local > ../src/types/supabase.ts
```

## 📁 Folder Structure
- `/migrations`: SQL files defining the database schema (The "DNA").
- `config.toml`: General Supabase configuration and ports.
- `seed.sql`: Dummy data for local development only.

## 🔗 Local Dashboard
Once started, you can access the local control panel at:
👉 http://localhost:54323

## ☁️ Cloud / LIVE Workflow
Use this to sync your changes with the Supabase Cloud project (São Paulo region).

1. Link to Cloud Project
Connect your local CLI with the remote project (only needed once or when changing projects).

```bash
npx supabase link --project-ref <your-project-id>
```
2. Push Migrations to LIVE
Apply new migration files to the production database. This does not delete data; it only updates the schema.

```bash
npx supabase db push
```
3. Generate TypeScript Types (Remote)
Sync your frontend types with the actual LIVE database schema.

```bash
npx supabase gen types typescript --linked > ../src/types/database.types.ts
```

🚦 Important Rules
Migrations are Immutable: Never edit a migration file that has already been "pushed" to LIVE. If you need a change, create a new migration.

No Manual Schema Changes: Avoid using the Supabase Web Dashboard to create tables or columns. Always use migrations and db push.

Seed Data: The seed.sql file is only for local development. It will never be pushed to the LIVE environment.

📁 Folder Structure
/migrations: SQL files defining the database schema (The "DNA").

config.toml: General Supabase configuration.

seed.sql: Dummy data for local development only.

🔗 Dashboards
- Local Studio: http://localhost:54323
- Live Dashboard: https://supabase.com/dashboard

## 🛠 Evolving the Database (Production-Ready Workflow)

Once the database is LIVE, we never edit old migration files. We follow an **incremental workflow**:

### 1. Create a New Migration
Choose your preferred method to generate a new timestamped SQL file:

* **Option A: Manual (Code-First)**
    ```bash
    npx supabase migration new name_of_your_change
    ```
    *Creates an empty `.sql` file. You write the SQL manually in VS Code.*

* **Option B: Automatic (UI-First)**
    1. Make changes in your **Local Dashboard** (Studio) using the interface.
    2. Run: `npx supabase db diff -f name_of_your_change`
    *Supabase compares your Docker DB with your files and writes the SQL for you.*

### 2. Validate Locally
Always test your new migration in your local environment before pushing to the cloud:
```bash
npx supabase db reset
``` 

If this finishes without errors, your SQL is safe to deploy.

### 3. Sync to LIVE
Upload the changes to the Supabase Cloud project:

```bash
npx supabase db push
```

### ⚠️ Important: Deploy Synchronization
It is crucial to understand that Vercel and Supabase are independent deployments:

Vercel (git push): Deploys the Frontend (React/Next.js). It DOES NOT update the database.

Supabase (db push): Deploys the Backend (Tables, RLS, Functions).

Correct Deployment Order:

- Always db push first: Prepare the database for the new features.
- Then git push: Update the code that will use those new features.
- Rule of thumb: If you deploy code that looks for a table that hasn't been created yet with db push, the app will crash. Infrastructure first, Code second.

