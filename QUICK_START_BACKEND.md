# Quick Start Backend (No MongoDB Required!)

## 🚀 Super Simple Way to Start

### Windows:
```bash
cd backend
start-simple.bat
```

### Mac/Linux:
```bash
cd backend
chmod +x start-simple.sh
./start-simple.sh
```

### Or Manually:
```bash
cd backend
set MOCK_AUTH=true
npm run dev
```

## ✅ What This Does

- **Starts server on port 3000**
- **No MongoDB needed!**
- **Login with ANY email/password**
- **Perfect for testing the frontend**

## 🔓 Mock Login Mode

When you see:
```
🔓 MOCK MODE ENABLED
   - Login with any email/password
   - No database required
   - Perfect for testing!
```

You can now:
- ✅ Login with any email (e.g., `test@test.com`)
- ✅ Use any password (e.g., `password123`)
- ✅ Get a balance of $1326
- ✅ Use the app without database

## 📝 Example Login

**Email**: `anything@example.com`  
**Password**: `anything`

Both will work! No signup needed.

## 🎯 What Works in Mock Mode

- ✅ Login (any credentials)
- ✅ View balance ($1326)
- ✅ Dashboard loads
- ✅ Navigation works
- ❌ Signup (not needed in mock mode)
- ❌ Real transactions (will use mock data)

## 🔄 To Use Real Database Later

Just start normally:
```bash
cd backend
npm run dev
```

And make sure MongoDB is running!

---

**That's it! Start the server and login with anything!** 🎉

