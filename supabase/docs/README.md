# 🚀 Supabase Local Infrastructure

This folder contains the database schema, migrations, and configuration for **The Olivia Project**. We use the Supabase CLI + Docker to maintain a consistent **development** environment.

## 🛠 Prerequisites

- **Docker Desktop**: Must be running.
- **Node.js**: v20 or higher.
- **Supabase CLI**: Installed via npm: 
```bash
npx supabase init
```

---

## 💻 Essential Commands

### 1. Start the Environment
Run this to spin up all Docker containers (DB, Auth, Studio, etc.).
```bash
npx supabase start
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
