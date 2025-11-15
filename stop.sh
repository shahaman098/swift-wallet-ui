#!/bin/bash

echo "========================================"
echo "Stopping Swift Wallet Treasury System"
echo "========================================"
echo ""

# Stop backend if PID file exists
if [ -f ".pids/backend.pid" ]; then
    BACKEND_PID=$(cat .pids/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 1
        # Force kill if still running
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo "Backend server stopped."
    else
        echo "Backend server not running (PID file exists but process not found)."
    fi
    rm -f .pids/backend.pid
else
    echo "Backend PID file not found."
fi

# Stop frontend if PID file exists
if [ -f ".pids/frontend.pid" ]; then
    FRONTEND_PID=$(cat .pids/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        sleep 1
        # Force kill if still running
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo "Frontend server stopped."
    else
        echo "Frontend server not running (PID file exists but process not found)."
    fi
    rm -f .pids/frontend.pid
else
    echo "Frontend PID file not found."
fi

# Also kill any processes on ports 3000 and 8080
echo ""
echo "Checking for processes on ports 3000 and 8080..."

# Port 3000 (backend)
if command -v lsof &> /dev/null; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:8080 | xargs kill -9 2>/dev/null
elif command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null
    fuser -k 8080/tcp 2>/dev/null
else
    echo "Note: lsof or fuser not available, skipping port-based cleanup"
fi

# Clean up log files
if [ -d ".pids" ]; then
    echo ""
    echo "Cleaning up log files..."
    rm -f .pids/*.log
fi

echo ""
echo "========================================"
echo "All servers stopped!"
echo "========================================"
echo ""

