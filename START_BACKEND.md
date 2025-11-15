# How to Start the Backend Server

## Quick Start

### Option 1: Using npm (Recommended)
```bash
cd backend
npm run dev
```

### Option 2: Using the start script
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```

## What You Should See

When the server starts successfully, you'll see:
```
✅ MongoDB connected successfully
📦 Database: swiftwallet
✅ Smart contracts initialized
🚀 Treasury Backend running on port 3000
📊 Health check: http://localhost:3000/health
🌐 API Base URL: http://localhost:3000

✅ Server is ready! You can now try signing up.
```

## Troubleshooting

### MongoDB Not Running
If you see:
```
⚠️  MongoDB connection failed: ...
💡 Server will start but database features will not work
```

**Solution**: Start MongoDB
- **Windows**: 
  - Open Services (Win+R → services.msc)
  - Find "MongoDB" service
  - Right-click → Start
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### Port 3000 Already in Use
If you see:
```
❌ Failed to start server: Port 3000 is already in use
```

**Solution**: 
1. Find what's using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```
2. Kill the process or use a different port:
   ```bash
   # Set PORT environment variable
   PORT=3001 npm run dev
   ```

### Dependencies Not Installed
If you see module errors:
```bash
cd backend
npm install
```

## Verify Server is Running

1. **Health Check**: Open http://localhost:3000/health in browser
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Signup**: Try signing up in the frontend
   - Should now work if server is running

## Server Will Start Even Without MongoDB

The server will now start even if MongoDB isn't running, but:
- ❌ Signup/Login won't work (needs database)
- ❌ Wallet operations won't work
- ✅ Health check will work
- ✅ You can test API connectivity

**To fully use the app, MongoDB must be running!**

---

**After starting the server, try signing up again!** ✅

