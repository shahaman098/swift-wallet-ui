# Database Setup - Quick Guide

## ⚠️ The server cannot start without a PostgreSQL database

You need to set up a PostgreSQL database and configure it in your `.env` file.

## 🚀 Fastest Option: Free Cloud Database (Recommended)

### Step 1: Get a Free Database (Choose One)

**Option A: Supabase (Easiest)**
1. Go to https://supabase.com
2. Click "Start your project" → Sign up (free)
3. Create a new project
4. Wait for project to be ready (~2 minutes)
5. Go to **Settings** → **Database**
6. Find your connection details:
   - **Host**: `db.xxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (shown in settings, or reset it)

**Option B: Neon (Alternative)**
1. Go to https://neon.tech
2. Sign up (free)
3. Create a project
4. Copy connection string from dashboard

### Step 2: Update Your .env File

Open `.env` in the project root and replace with your database details:

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
DB_SSL=true
PORT=3000
```

**Important**: Replace `your_actual_password_here` with your real database password!

### Step 3: Start the Server

```bash
npm run server
```

You should see:
```
Connecting to database...
Database connection established
Database schema initialized successfully
Swift Wallet backend listening on port 3000
```

## ✅ That's it! Your site should now be accessible.

---

## Alternative: Local PostgreSQL

If you prefer to run PostgreSQL locally:

1. **Install PostgreSQL**: https://www.postgresql.org/download/
2. **Create database**:
   ```sql
   CREATE DATABASE wallet_db;
   ```
3. **Update .env**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=wallet_db
   DB_USER=postgres
   DB_PASSWORD=your_local_password
   DB_SSL=false
   PORT=3000
   ```

## Need Help?

- See `QUICK_START.md` for more details
- See `DATABASE_SETUP.md` for comprehensive guide

