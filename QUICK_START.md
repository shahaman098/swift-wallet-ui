# Quick Start Guide

## The server needs a PostgreSQL database to run

You have **3 options** to get started:

### Option 1: Free Cloud Database (Recommended - 2 minutes)

1. **Sign up for a free Supabase account**: https://supabase.com
2. **Create a new project**
3. **Get your connection details** from Settings → Database
4. **Create `.env` file** in the project root with:

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=true
PORT=3000
```

5. **Start the server**: `npm run server`

### Option 2: Free Neon Database (Alternative)

1. **Sign up**: https://neon.tech
2. **Create a project**
3. **Copy connection string** from dashboard
4. **Create `.env` file** with connection details

### Option 3: Local PostgreSQL

1. **Install PostgreSQL** on your machine
2. **Create database**: `CREATE DATABASE wallet_db;`
3. **Create `.env` file**:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallet_db
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_SSL=false
PORT=3000
```

## After creating .env file:

```bash
npm run server
```

The server will automatically create all database tables on first run.

