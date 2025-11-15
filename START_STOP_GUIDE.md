# Start/Stop Scripts Guide

## 🚀 Quick Start

### Windows
```bash
# Start both servers
start.bat

# Stop both servers
stop.bat
```

### Mac/Linux
```bash
# Make scripts executable (first time only)
chmod +x start.sh stop.sh

# Start both servers
./start.sh

# Stop both servers
./stop.sh
```

---

## 📋 What the Scripts Do

### `start.bat` / `start.sh`
1. ✅ Checks if Node.js is installed
2. ✅ Displays Node.js version
3. ✅ Installs dependencies if missing
4. ✅ Starts backend server (port 3000) in a new window/process
5. ✅ Starts frontend server (port 8080) in a new window/process
6. ✅ Shows server URLs

### `stop.bat` / `stop.sh`
1. ✅ Stops backend server (port 3000)
2. ✅ Stops frontend server (port 8080)
3. ✅ Cleans up process IDs
4. ✅ Cleans up log files

---

## 🔧 Node.js Version

**Required: Node.js 18 or higher**

The scripts will check your Node.js version automatically.

- **Recommended**: Node.js 18.x LTS or 20.x LTS
- **Check version**: `node --version`
- **Install**: https://nodejs.org/

See `NODE_VERSION.md` for details.

---

## 📁 Files Created

- `start.bat` - Windows start script
- `start.sh` - Mac/Linux start script
- `stop.bat` - Windows stop script
- `stop.sh` - Mac/Linux stop script
- `.nvmrc` - Node version for nvm users
- `.node-version` - Node version for asdf users
- `.pids/` - Directory for process IDs (created automatically)
- `.pids/*.log` - Server logs (created automatically)

---

## 🖥️ Windows Usage

### Start
Double-click `start.bat` or run:
```cmd
start.bat
```

This will:
- Open a new window for backend
- Open a new window for frontend
- Keep both running independently

### Stop
Double-click `stop.bat` or run:
```cmd
stop.bat
```

This will:
- Kill processes on ports 3000 and 8080
- Close the server windows

---

## 🍎 Mac/Linux Usage

### First Time Setup
```bash
chmod +x start.sh stop.sh
```

### Start
```bash
./start.sh
```

This will:
- Start backend in background (logs to `.pids/backend.log`)
- Start frontend in background (logs to `.pids/frontend.log`)
- Display process IDs

### Stop
```bash
./stop.sh
```

This will:
- Stop both processes by PID
- Kill any processes on ports 3000/8080
- Clean up log files

### View Logs
```bash
# Backend logs
tail -f .pids/backend.log

# Frontend logs
tail -f .pids/frontend.log
```

---

## 🐛 Troubleshooting

### "Node.js is not installed"
- Install Node.js 18+ from https://nodejs.org/
- Restart terminal/command prompt
- Run `node --version` to verify

### "Port already in use"
- Run `stop.bat` or `./stop.sh` first
- Or manually kill processes:
  - **Windows**: `netstat -ano | findstr :3000` then `taskkill /F /PID <pid>`
  - **Mac/Linux**: `lsof -ti:3000 | xargs kill -9`

### Scripts don't work on Mac/Linux
- Make sure they're executable: `chmod +x start.sh stop.sh`
- Use `./start.sh` not `start.sh`

### Can't see server windows (Windows)
- Check Task Manager for Node processes
- Or run `netstat -ano | findstr :3000` to see if servers are running

---

## 📊 Process Management

### Windows
- Servers run in separate `cmd` windows
- Windows are titled "Backend Server" and "Frontend Server"
- Close windows manually or use `stop.bat`

### Mac/Linux
- Servers run in background
- PIDs stored in `.pids/backend.pid` and `.pids/frontend.pid`
- Logs in `.pids/backend.log` and `.pids/frontend.log`

---

## ✅ Verification

After running `start.bat` or `./start.sh`:

1. **Backend**: Visit http://localhost:3000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Visit http://localhost:8080
   - Should show the login page

3. **Check processes**:
   - **Windows**: Task Manager → Details → Look for `node.exe`
   - **Mac/Linux**: `ps aux | grep node`

---

## 🔄 Alternative: Manual Start

If scripts don't work, start manually:

### Terminal 1 (Backend)
```bash
cd backend
npm install  # First time only
npm run dev
```

### Terminal 2 (Frontend)
```bash
npm install  # First time only
npm run dev
```

---

## 📝 Notes

- Scripts automatically install dependencies if missing
- First run may take longer (installing packages)
- Servers will keep running until you stop them
- Logs are saved in `.pids/` directory (Unix only)
- Windows shows server output in separate windows

---

## 🎯 Quick Reference

| Action | Windows | Mac/Linux |
|--------|---------|-----------|
| Start | `start.bat` | `./start.sh` |
| Stop | `stop.bat` | `./stop.sh` |
| Check Node | `node --version` | `node --version` |
| View Logs | Check windows | `tail -f .pids/*.log` |
| Kill Port | `stop.bat` | `./stop.sh` |

---

**That's it!** Just run `start.bat` (Windows) or `./start.sh` (Mac/Linux) and you're ready to go! 🚀

