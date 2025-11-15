# 🚀 Quick Database Setup - Get Your Site Running in 5 Minutes

## ⚠️ Your site needs a PostgreSQL database to work

The server is configured correctly, but you need to set up a database connection.

## ✅ Step-by-Step Setup (Choose One Option)

### Option 1: Free Supabase Database (Easiest - Recommended)

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" → Sign up (free, no credit card needed)
3. **Create a new project**:
   - Choose a name
   - Choose a password (save this!)
   - Wait ~2 minutes for setup
4. **Get connection details**:
   - Go to **Settings** → **Database**
   - Find "Connection string" or "Connection info"
   - You'll see:
     - **Host**: `db.xxxxx.supabase.co`
     - **Port**: `5432`
     - **Database**: `postgres`
     - **User**: `postgres`
     - **Password**: (the one you set, or reset it)
5. **Update your `.env` file** in the project root:

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
DB_SSL=true
PORT=3000
```

6. **Test the connection**:
```bash
npm run test-db
```

7. **Start the server**:
```bash
npm run server
```

You should see:
```
✅ Database connection established
✅ Database schema initialized
Swift Wallet backend listening on port 3000
```

---

### Option 2: Free Neon Database

1. **Go to**: https://neon.tech
2. **Sign up** (free)
3. **Create a project**
4. **Copy connection string** from dashboard
5. **Extract details** and update `.env` file
6. **Test**: `npm run test-db`
7. **Start**: `npm run server`

---

### Option 3: Local PostgreSQL

1. **Install PostgreSQL**: https://www.postgresql.org/download/
2. **Start PostgreSQL service**
3. **Create database**:
   ```sql
   CREATE DATABASE wallet_db;
   ```
4. **Update `.env`**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=wallet_db
   DB_USER=postgres
   DB_PASSWORD=your_local_password
   DB_SSL=false
   PORT=3000
   ```
5. **Test**: `npm run test-db`
6. **Start**: `npm run server`

---

## 🧪 Testing Your Connection

Before starting the server, test your database connection:

```bash
npm run test-db
```

This will verify:
- ✅ Environment variables are set correctly
- ✅ Database connection works
- ✅ Credentials are valid

---

## 🎯 After Database is Configured

1. **Test connection**: `npm run test-db`
2. **Start backend**: `npm run server` (in one terminal)
3. **Start frontend**: `npm run dev` (in another terminal)
4. **Open browser**: http://localhost:5173 (or the port shown)

---

## ❌ Troubleshooting

### "Connection refused"
- Database server is not running
- Wrong host/port
- Firewall blocking connection

### "Authentication failed"
- Wrong password
- User doesn't exist

### "Database does not exist"
- Create the database first
- Check DB_NAME in .env

### "ENOTFOUND" error
- Invalid hostname
- Check DB_HOST in .env

---

## 📝 Important Notes

- **Never commit `.env` file** to git (it's already in .gitignore)
- **Use strong passwords** for production
- **Free tiers** are perfect for development
- **Database is created automatically** - tables are created on first run

---

## ✅ Success Checklist

- [ ] Database account created (Supabase/Neon/Local)
- [ ] `.env` file updated with real credentials
- [ ] `npm run test-db` passes
- [ ] `npm run server` starts successfully
- [ ] Site is accessible in browser

---

**Need help?** Check the error messages - they're designed to guide you!

