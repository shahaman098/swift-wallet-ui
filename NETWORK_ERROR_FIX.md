# Network Error Fix Guide

## Problem
Getting "Network Error" when trying to sign up.

## Common Causes

### 1. Backend Server Not Running
**Solution**: Start the backend server
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Treasury Backend running on port 3000
📊 Health check: http://localhost:3000/health
💾 MongoDB connected
⛓️  Smart contracts ready
```

### 2. MongoDB Not Running
**Solution**: Start MongoDB service
- **Windows**: Check if MongoDB service is running in Services
- **Mac/Linux**: `brew services start mongodb-community` or `sudo systemctl start mongod`

### 3. Wrong Port Configuration
**Check**:
- Frontend expects backend on `http://localhost:3000`
- Backend should run on port 3000
- Frontend runs on port 8080

### 4. CORS Issues
**Check**: Backend CORS is configured to allow `http://localhost:8080`

## Quick Test

1. **Test Backend Health**:
   Open browser: http://localhost:3000/health
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Signup Endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Check Network tab for failed requests
   - Check Console for error messages

## Fixed Issues

### Better Error Messages
- Network errors now show helpful message
- Tells user to check if backend is running
- Shows MongoDB connection requirement

### Error Handling
- Frontend now detects network errors
- Shows specific error messages
- Console logging for debugging

## Verification Steps

1. ✅ Backend is running on port 3000
2. ✅ MongoDB is running and connected
3. ✅ Frontend can reach http://localhost:3000/health
4. ✅ No CORS errors in browser console
5. ✅ Signup request reaches backend

---

**If you still get network errors, check:**
- Backend terminal for error messages
- Browser console (F12) for detailed errors
- MongoDB connection status
- Firewall blocking port 3000

