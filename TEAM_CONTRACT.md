# ✅ TEAM CONTRACT — What EVERY Team Member Must Follow

This document ensures our app works consistently across all laptops, all branches, and during deployment.

**If anyone breaks these rules → the app will break for everyone.**

---

## 1️⃣ Repository Structure Rules (CRITICAL)

We all follow the same repo structure:

**Frontend**
- `/src` → React + Vite + TypeScript
- `/src/pages` → All page components
- `/src/components` → Reusable UI components
- `/src/api` → API client configuration

**Backend**
- `/backend` → Express + TypeScript
- `/backend/src/api` → API route handlers
- `/backend/src/services` → Business logic services

**Smart Contracts**
- `/contracts/core` → Core smart contracts
- `/contracts/policies` → Policy modules
- `/contracts/interfaces` → Contract interfaces

**SDK & Tools**
- `/sdk` → TypeScript SDK
- `/cli` → CLI tools

### STRICT RULES

❌ **Do NOT** mix frontend code into `/backend`
❌ **Do NOT** create backend folders inside `/src`
❌ **Do NOT** create random `api/` folders in root
❌ **Do NOT** run `npm init` or `vite` in the root folder
❌ **Do NOT** move files from `/src` to `/frontend` or vice versa
❌ **Do NOT** create new root-level project folders

✔ **Follow the folder structure exactly**

This prevents 90% of breakages.

---

## 2️⃣ Node & Package Manager Versions (MUST MATCH)

Everyone must use the same versions:

**Node:** `v18.x` or `v20.x` (see `.nvmrc` and `.node-version`)

**NPM:** `v9.x` or `v10.x`

### ❌ Do NOT use:
- Bun
- Yarn
- PNPM

**Using different package managers = broken node_modules.**

### Check Your Version:
```bash
node --version  # Should show v18.x or v20.x
npm --version   # Should show v9.x or v10.x
```

---

## 3️⃣ Environment Variables (ALL IDENTICAL)

Everyone MUST copy:

`/backend/.env.example` → `/backend/.env`

### Required Keys (for all developers):

```env
PORT=3000
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/treasury
REDIS_URL=redis://localhost:6379
CIRCLE_API_KEY=your-circle-api-key
CIRCLE_API_URL=https://api.circle.com
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
PRIVATE_KEY=your-private-key-for-contracts
```

**If anyone renames or changes a key → backend will crash.**

---

## 4️⃣ API CONTRACT (DO NOT CHANGE ENDPOINTS)

These are FINAL unless team agrees together.

### AUTH
- `POST /api/auth/signup`
- `POST /api/auth/login`

### WALLET (Existing Features)
- `GET  /api/wallet/balance`
- `POST /api/wallet/deposit`
- `POST /api/wallet/send`

### ACTIVITY
- `GET  /api/activity`

### TREASURY (New Features)
- `POST /api/treasury/orgs`
- `GET  /api/treasury/orgs/:orgId`
- `POST /api/treasury/orgs/:orgId/departments`
- `GET  /api/treasury/orgs/:orgId/departments`
- `POST /api/treasury/orgs/:orgId/allocation-rules`
- `POST /api/treasury/orgs/:orgId/distribution-rules`
- `POST /api/treasury/orgs/:orgId/execute-allocations`

### ML & INTELLIGENCE
- `GET  /api/ml/orgs/:orgId/recommendations`
- `POST /api/ml/evaluate-cycle`

### GATEWAY
- `POST /api/gateway/transfer`
- `POST /api/gateway/payout`

### ❌ Rules:
- No renaming routes
- No moving files
- No restructuring controllers
- Frontend depends on these exact endpoints

---

## 5️⃣ Frontend API Client Must Match Backend

The API client in:

`/src/api/client.js`

**MUST use the exact backend routes.**

If someone modifies the backend route → they must update the client immediately.

### Current API Client Structure:
```javascript
// Auth APIs
authAPI.signup()
authAPI.login()

// Wallet APIs
walletAPI.getBalance()
walletAPI.deposit()
walletAPI.send()

// Activity APIs
activityAPI.getActivity()

// Treasury APIs
treasuryAPI.createOrg()
treasuryAPI.getOrg()
treasuryAPI.createDepartment()
// ... etc

// ML APIs
mlAPI.getRecommendations()

// Gateway APIs
gatewayAPI.transfer()
gatewayAPI.payout()
```

**Keep this structure consistent!**

---

## 6️⃣ Database Schema Rules (Prisma - When Implemented)

**No one changes Prisma schema alone.**

Schema changes break:
- migrations
- Prisma client
- backend logic
- Treasury/ML/Gateway interactions

### If someone needs a change:
1. Inform team
2. Agree together
3. Update `schema.prisma`
4. Run migration
5. Commit migration folder
6. Tell everyone to run: `npx prisma migrate dev`

---

## 7️⃣ Do NOT Edit Auto-Generated Code Randomly

Generated service files such as:
- `circle.service.ts`
- `cctp.service.ts`
- `gateway.service.ts`
- `treasury.service.ts`
- `ml.service.ts`

**Should never be edited unless:**
- The teammate knows Circle API flows
- Confirms with the team
- Tests the entire flow end-to-end

**Random edits → break CCTP, Gateway, or treasury operations.**

---

## 8️⃣ Frontend Design Consistency

All teammates must use the same design system:

**Design System:**
- Liquid glass design (`liquid-glass`, `liquid-glass-premium` classes)
- Arc-inspired gradients (`text-arc-gradient`)
- Same color palette (primary: `#4A44F2`, accent: `#31D2F7`, success: `#3CF276`)
- Same spacing & margins (Tailwind utilities)
- Same component naming (shadcn-ui components)
- Same navigation flow

**Component Library:**
- shadcn-ui components in `/src/components/ui`
- Framer Motion for animations
- Recharts for data visualization
- Tailwind CSS for styling

**If everyone uses different design prompts → UI breaks.**

---

## 9️⃣ Smart Contract Rules

**Contract Structure:**
- Core contracts in `/contracts/core`
- Policy modules in `/contracts/policies`
- Interfaces in `/contracts/interfaces`

**Rules:**
- ❌ Do NOT modify core contracts without team approval
- ❌ Do NOT change contract interfaces
- ❌ Do NOT deploy contracts without testing
- ✔ Follow Solidity best practices
- ✔ Use OpenZeppelin contracts where applicable
- ✔ Test contracts before deployment

---

## 🔟 Start/Stop Scripts (MUST USE)

**Everyone must use the provided scripts:**

### Windows:
- `start.bat` - Starts both backend and frontend
- `stop.bat` - Stops both servers

### Mac/Linux:
- `./start.sh` - Starts both backend and frontend
- `./stop.sh` - Stops both servers

**Do NOT manually start servers unless debugging.**

---

## 1️⃣1️⃣ Deployment Rules

**Frontend deploys to:**
- Vercel
- Netlify
- Any static hosting

**Backend deploys to:**
- Render
- Railway
- DigitalOcean
- Any non-serverless host

**❌ Do NOT deploy backend to Vercel**
(Express + Prisma + webhooks fail on serverless.)

**Smart Contracts:**
- Deploy to testnet first
- Get team approval for mainnet
- Document contract addresses

---

## 1️⃣2️⃣ Communication Rules

When making changes to:
- API routes
- DB schema
- Env variables
- Folder structure
- Component structures
- Smart contracts
- Start/stop scripts

**You MUST:**
- ✔ Announce in team chat
- ✔ Commit with clear message
- ✔ Test frontend & backend
- ✔ Inform team before pushing
- ✔ Update this contract if structure changes

---

## 🧠 Quick YES/NO Checklist

| Category | Must Match? | Why |
|----------|-------------|-----|
| Repo structure | ✔ Yes | Prevents broken imports |
| Node versions | ✔ Yes | Prevents dependency conflicts |
| API routes | ✔ Yes | Prevents frontend 404s |
| DB schema | ✔ Yes | Prevents migrations from breaking |
| .env keys | ✔ Yes | Prevents backend crashes |
| Circle/Gateway usage | ✔ Yes | Prevents wallet & deposit failure |
| Design system | ✔ Yes | Prevents UI inconsistencies |
| Start/stop scripts | ✔ Yes | Ensures consistent dev environment |
| Smart contracts | ✔ Yes | Prevents onchain failures |
| Deployment choice | ✔ Yes | Prevents backend downtime |

---

## ✅ Final Ready-to-Paste Message

**🚀 TEAM CONTRACT — READ BEFORE WORKING ON THE PROJECT**

This document ensures we all build the SAME app without breaking anything.

**Every teammate must follow these rules:**

### 1. Repository Structure
- `/src` = React + Vite + TypeScript (frontend)
- `/backend` = Express + TypeScript (backend)
- `/contracts` = Smart contracts
- `/sdk` = TypeScript SDK
- `/cli` = CLI tools

**Don't mix frontend/backend code. Don't create new root projects. Don't add API folders randomly.**

### 2. Node & NPM Versions
Use ONLY:
- Node `v18.x` or `v20.x` (check `.nvmrc`)
- NPM `v9.x` or `v10.x`

**Do NOT use Yarn, PNPM, or Bun.**

### 3. Environment Variables
Copy `/backend/.env.example` to `/backend/.env`.

**Required keys:**
```env
PORT=3000
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
CIRCLE_API_KEY=...
```

### 4. API Contract (Final)
**Auth:**
- `POST /api/auth/signup`
- `POST /api/auth/login`

**Wallet:**
- `GET /api/wallet/balance`
- `POST /api/wallet/deposit`
- `POST /api/wallet/send`

**Treasury:**
- `POST /api/treasury/orgs`
- `GET /api/treasury/orgs/:orgId`
- `POST /api/treasury/orgs/:orgId/departments`
- ... (see full list above)

**Do NOT rename/move these.**

### 5. Frontend API Client
`/src/api/client.js` must match backend routes exactly.

### 6. Prisma Schema Rules
Do NOT change schema alone. After approved change:
```bash
npx prisma migrate dev
```

### 7. Generated Files
Don't modify Circle/CCTP/Gateway/Treasury/ML service files unless discussed and fully tested.

### 8. Design Consistency
Use same design system:
- Liquid glass design
- Arc-inspired gradients
- shadcn-ui components
- Framer Motion animations
- Same color palette and spacing

### 9. Start/Stop Scripts
**Windows:** Use `start.bat` and `stop.bat`
**Mac/Linux:** Use `./start.sh` and `./stop.sh`

### 10. Deployment
- Frontend → Vercel/Netlify
- Backend → Render/Railway/DigitalOcean
- **NOT Vercel for backend**

### 11. Smart Contracts
- Don't modify core contracts without approval
- Test before deployment
- Document contract addresses

### 12. Communication
If you change routes, schema, env vars, structure, or contracts:
- Tell the team
- Commit clearly
- Test both sides
- Update this contract

---

## 📋 Quick Reference

**Start Development:**
```bash
# Windows
start.bat

# Mac/Linux
chmod +x start.sh stop.sh
./start.sh
```

**Stop Development:**
```bash
# Windows
stop.bat

# Mac/Linux
./stop.sh
```

**Check Versions:**
```bash
node --version  # Should be v18.x or v20.x
npm --version   # Should be v9.x or v10.x
```

**Frontend:** http://localhost:8080
**Backend:** http://localhost:3000

---

**Remember: Breaking these rules breaks the app for everyone! 🚨**

