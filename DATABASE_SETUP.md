# Database Setup Guide

This application now uses **PostgreSQL** as a remote database instead of local file storage.

## Prerequisites

1. A PostgreSQL database server (local or remote)
2. Database credentials (host, port, database name, user, password)

## Setup Steps

### 1. Create a PostgreSQL Database

If you don't have a PostgreSQL database yet, you can:

**Option A: Use a cloud provider**
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Railway](https://railway.app) (Free tier available)
- [AWS RDS](https://aws.amazon.com/rds/)
- [Google Cloud SQL](https://cloud.google.com/sql)
- [Azure Database](https://azure.microsoft.com/en-us/products/postgresql)

**Option B: Install PostgreSQL locally**
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database and User

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE wallet_db;
CREATE USER wallet_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wallet_db TO wallet_user;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Database Configuration (PostgreSQL)
DB_HOST=your-database-host.com
DB_PORT=5432
DB_NAME=wallet_db
DB_USER=wallet_user
DB_PASSWORD=your_secure_password
DB_SSL=true

# Server Configuration
PORT=3000
```

**For local PostgreSQL:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallet_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

**For cloud providers (Supabase, Neon, etc.):**
- Use the connection string provided by your provider
- Extract: host, port, database name, user, password
- Set `DB_SSL=true` for secure connections

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Server

```bash
npm run server
```

The server will:
1. Connect to the PostgreSQL database
2. Create all necessary tables automatically
3. Start listening on port 3000

## Verification

Check the console output when starting the server:
```
Connecting to database...
Database connection established
Database schema initialized successfully
Swift Wallet backend listening on port 3000
Database: your-host:5432/wallet_db
```

## Troubleshooting

### Connection Refused
- Check that PostgreSQL is running
- Verify host and port are correct
- Check firewall settings for remote databases

### Authentication Failed
- Verify username and password
- Check database user permissions

### SSL Connection Error
- For local databases, set `DB_SSL=false`
- For remote databases, ensure SSL is enabled

### Database Does Not Exist
- Create the database first (see step 2)
- Verify `DB_NAME` matches the created database

## Migration from SQLite

If you had data in the old SQLite database, you'll need to:
1. Export data from SQLite (if needed)
2. Import into PostgreSQL (if needed)
3. The new database starts fresh - all tables are created automatically

## Security Notes

- Never commit `.env` file to version control
- Use strong passwords for database users
- Enable SSL for remote database connections
- Use environment variables or secret management services in production

