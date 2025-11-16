# Noah's Arc — Liquid Glass Unified Demo Platform

A unified, high-design, transparent "frosted glass" dashboard that visually integrates Tracks 1–4 into one seamless application.

## 🎯 Overview

This unified dashboard brings together all 4 Arc × Circle challenge tracks into a single, polished application with a stunning liquid glass aesthetic.

## 🧊 Design System

### Liquid Glass Aesthetic
- **Full Transparency**: All UI surfaces use `backdrop-filter: blur(8px)` with `rgba(255, 255, 255, 0.05)` backgrounds
- **Color Palette**: Black, White, and Gray only (0–100% opacity)
- **Smooth Transitions**: 0.25s fade-in animations on all page loads
- **Seamless Navigation**: Instant loading with shared glass aesthetic

### CSS Variables
```css
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.15);
--text-primary: rgba(255, 255, 255, 0.9);
--text-secondary: rgba(255, 255, 255, 0.6);
--text-muted: rgba(255, 255, 255, 0.4);
```

## 📦 Track Modules

### Track 1 — SmartPay Scheduler (Programmable Payouts)
**Component**: `src/components/Scheduler.tsx`
**Route**: `/unified` → Tab: "Track 1: Scheduler"

**Features**:
- Add recipients with percentage allocations
- Preview allocation chart
- Set interval (daily/weekly/monthly) + threshold
- Deploy Contract (instant mock deployment)
- Execute Distribution (instant mock execution)
- Event Log showing all distribution events

**API Endpoints**:
- `POST /api/scheduler/deploy` - Deploy contract
- `POST /api/scheduler/execute` - Execute distribution

### Track 2 — Cross-Chain Bridging (BridgeKit + Arc)
**Component**: `src/components/Bridging.tsx`
**Route**: `/unified` → Tab: "Track 2: Bridge"

**Features**:
- Self-Bridge mode
- Managed Bridge mode
- Chain selection (Sepolia, Arc, Base Sepolia, Polygon Amoy)
- Progress bar animation (0% → 100% in 1.5s)
- Transaction feed with bridge events

**API Endpoints**:
- `POST /api/cctp/bridge` - Execute bridge

### Track 3 & 4 — Payments App + Embedded Wallet
**Component**: Integrated in `UnifiedDashboard.tsx`
**Route**: `/unified` → Tab: "Track 3/4: Payments"

**Features**:
- Quick access buttons to:
  - Send Payment (`/send-payment`)
  - Request Payment (`/request`)
  - Split Payment (`/split-payment`)
- Embedded wallet balance display
- Transaction history

### Conditional Treasury Splitter
**Component**: `src/components/ConditionalTreasurySplitter.tsx`
**Route**: `/unified` → Tab: "Treasury Splitter"

**Features**:
- Unlock time display
- Oracle status and approval button
- Recipients list with percentages
- Execute Distribution button
- Instant state changes on actions

**API Endpoints**:
- `POST /api/treasury/oracle-approve` - Approve oracle
- `POST /api/treasury/execute-distribution` - Execute distribution

## 🚀 Getting Started

### Frontend
```bash
cd integration/hub-frontend
npm install
npm run dev
```

### Backend
```bash
cd integration/hub-backend
npm install
npm run dev
```

### Access Unified Dashboard
Navigate to: `http://localhost:5173/unified`

## 📁 File Structure

```
integration/
├── hub-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scheduler.tsx          # Track 1 module
│   │   │   ├── Bridging.tsx           # Track 2 module
│   │   │   ├── ConditionalTreasurySplitter.tsx  # Treasury module
│   │   │   ├── EventFeed.tsx          # Unified event feed
│   │   │   ├── GlassCard.tsx          # Reusable glass card
│   │   │   └── BalanceCard.tsx        # Wallet balance display
│   │   ├── pages/
│   │   │   └── UnifiedDashboard.tsx   # Main unified dashboard
│   │   └── index.css                  # Liquid glass CSS system
│   └── ...
├── hub-backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── schedulerRoutes.ts     # Track 1 endpoints
│   │   │   ├── treasuryRoutes.ts      # Treasury endpoints
│   │   │   └── eventRoutes.ts         # Event feed endpoint
│   │   ├── controllers/
│   │   │   ├── schedulerController.ts
│   │   │   ├── treasuryController.ts
│   │   │   └── eventController.ts
│   │   └── server.ts                  # Express server
│   └── ...
└── UNIFIED_DASHBOARD_README.md        # This file
```

## 🔧 Mock Backend Responses

All endpoints return **instant successful responses** with mock data:

### Scheduler
```json
{
  "success": true,
  "txHash": "0xMOCK123...",
  "contractAddress": "0xMOCK456...",
  "deployedAt": "2024-01-01T00:00:00.000Z"
}
```

### Bridge
```json
{
  "status": "completed",
  "txHash": "0xMOCK_BRIDGE123...",
  "messageId": "msg_1234567890",
  "completedAt": "2024-01-01T00:00:00.000Z"
}
```

### Treasury
```json
{
  "success": true,
  "txHash": "0xMOCK_TREASURY123...",
  "executedAt": "2024-01-01T00:00:00.000Z"
}
```

## ✨ Key Features

1. **Instant Response**: All actions complete instantly with simulated success
2. **Unified Event Feed**: All events from all tracks appear in one feed
3. **Liquid Glass UI**: Consistent frosted glass aesthetic throughout
4. **Smooth Animations**: Fade-in transitions, progress bars, hover effects
5. **Mock Data**: No real blockchain calls - perfect for demos

## 🎨 Component Usage

### GlassCard
```tsx
import GlassCard from "@/components/GlassCard";

<GlassCard title="My Card" description="Card description">
  Content here
</GlassCard>
```

### Using Liquid Glass Classes
```tsx
<div className="liquid-glass">Frosted glass container</div>
<div className="liquid-glass-premium">Premium glass container</div>
<div className="fade-in">Fade in animation</div>
```

## 🔄 Integration Points

The unified dashboard integrates:
- ✅ Track 1: SmartPay Scheduler
- ✅ Track 2: Cross-Chain Bridging
- ✅ Track 3/4: Payments & Embedded Wallet
- ✅ Conditional Treasury Splitter
- ✅ Unified Event Feed
- ✅ Balance Display

## 📝 Notes

- All backend responses are **simulated** for instant demo experience
- No real blockchain transactions occur
- Perfect for judge demonstrations
- All UI follows strict black/white/gray color scheme
- Transitions are smooth and instant (0.25s)

## 🎯 Demo Flow

1. Navigate to `/unified`
2. View balance card at top
3. Switch between tabs to explore each track
4. Perform actions (deploy, bridge, execute) - all instant
5. View unified event feed at bottom showing all activity

---

**Built for Arc × Circle Challenge — Unified Liquid Glass Platform**

