#!/bin/bash
echo "Starting Backend Server (Simple Mode)..."
echo ""
echo "This will start the server without requiring MongoDB"
echo "You can login with any email/password"
echo ""
cd "$(dirname "$0")"
export MOCK_AUTH=true
npm run dev

