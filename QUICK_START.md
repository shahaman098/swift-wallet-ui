# Quick Start Guide - Running the New Version

## 🚀 How to Run

### Step 1: Install Backend Dependencies (First Time Only)

Open a terminal in the project root and run:

```bash
cd backend
npm install
cd ..
```

### Step 2: Start the Backend Server

In your terminal, run:

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Treasury Backend running on port 3000
📊 Health check: http://localhost:3000/health
```

**Keep this terminal open!** The backend needs to keep running.

### Step 3: Start the Frontend (New Terminal)

Open a **NEW terminal window** (keep the backend running), and from the project root:

```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:8080/
```

### Step 4: Open in Browser

Go to: **http://localhost:8080**

---

## 🎨 What's New - What You'll See

### 1. **Existing Features (All Still Work!)**
Everything you had before still works exactly the same:
- ✅ Login/Signup pages
- ✅ Dashboard with balance card
- ✅ Add Money button
- ✅ Send Payment button
- ✅ Split Payment button
- ✅ Request Payment button
- ✅ Transaction history

### 2. **NEW: Treasury Button** 🆕
On the main dashboard, you'll now see a **third button** in the secondary actions row:
- **"Treasury"** button with a building icon
- Click it to access the new Treasury Management dashboard

### 3. **NEW: Treasury Dashboard** 🆕
When you click "Treasury", you'll see a new page with:

**Three Main Cards:**

1. **Organizations Card** (Left)
   - Shows your organizations
   - "Create Organization" button
   - Click an org to select it

2. **Departments Card** (Middle)
   - Shows departments for selected org
   - Department balance and cap
   - "Create Department" button

3. **Intelligence Card** (Right)
   - ML-powered recommendations
   - Runway estimate (months of funds)
   - Allocation suggestions
   - Risk flags

**Quick Actions Section:**
- Manage Rules button
- Automation button
- Analytics button

### 4. **What Works Right Now**

✅ **All existing wallet features** - Login, send money, etc.
✅ **Treasury Dashboard** - View and navigate
✅ **Create Organizations** - Via API (backend ready)
✅ **Create Departments** - Via API (backend ready)
✅ **ML Recommendations** - Mock data showing structure

### 5. **What's Behind the Scenes**

The backend now has:
- Treasury API endpoints (`/api/treasury/*`)
- ML API endpoints (`/api/ml/*`)
- Gateway API endpoints (`/api/gateway/*`)
- All existing wallet endpoints still work

---

## 🔍 Visual Differences

### Main Dashboard Changes:
- **Before**: 2x2 grid of action buttons
- **Now**: 2x2 grid + 1 new "Treasury" button (3 buttons in bottom row)

### New Pages:
- `/treasury` - Treasury Management Dashboard

### Navigation:
- Treasury accessible from main dashboard
- All existing routes still work

---

## 🧪 Try It Out

1. **Login** (or signup if new)
   - Go to http://localhost:8080/login
   - Use any email/password (creates account automatically)

2. **See the Dashboard**
   - You'll see your balance card
   - Notice the new "Treasury" button in the bottom row

3. **Click "Treasury"**
   - New dashboard opens
   - See the three cards (Orgs, Departments, Intelligence)

4. **Try Creating an Org** (via API - UI coming soon)
   - The backend is ready
   - You can test via Postman/curl:
     ```bash
     curl -X POST http://localhost:3000/api/treasury/orgs \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer YOUR_TOKEN" \
       -d '{"name":"Test Org","smartAccount":"0x0000000000000000000000000000000000000000"}'
     ```

---

## ⚠️ Troubleshooting

### Backend won't start?
- Make sure port 3000 is free
- Check: `cd backend && npm install` completed successfully
- Look for error messages in terminal

### Frontend can't connect?
- Make sure backend is running on port 3000
- Check browser console (F12) for errors
- Verify `http://localhost:3000/health` works in browser

### Don't see Treasury button?
- Make sure you're on `/dashboard` page
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console for errors

### Treasury page is empty?
- This is normal! You need to create an org first
- The page will auto-create a default org on first load
- Check browser console for any API errors

---

## 📊 What's Working vs. What's Coming

### ✅ Fully Working:
- All existing wallet features
- Treasury dashboard UI
- Backend API structure
- Navigation

### 🚧 Coming Soon (Structure Ready):
- Create Org/Dept UI forms
- Rule configuration UI
- Schedule management UI
- Actual Circle Gateway integration
- Database persistence (currently in-memory)

---

## 🎯 Quick Test Checklist

- [ ] Backend starts on port 3000
- [ ] Frontend starts on port 8080
- [ ] Can login/signup
- [ ] See main dashboard
- [ ] See new "Treasury" button
- [ ] Can click Treasury button
- [ ] See Treasury dashboard with 3 cards
- [ ] All existing buttons still work

If all checked ✅, you're good to go!

