# Swift Wallet UI - Frontend Summary for Backend Development

## Overview
This is a **React + TypeScript + Vite** frontend application for a digital wallet/payment system called "Swift Wallet" (also referenced as "PayWallet" in some UI text). The frontend is fully built with a modern UI using shadcn-ui components, Tailwind CSS, and Framer Motion animations. The backend needs to be built to match the API expectations defined in this document.

## Technology Stack

### Frontend Technologies
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Query (TanStack Query) 5.83.0
- **HTTP Client**: Axios 1.13.2
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.17
- **Animations**: Framer Motion 12.23.24
- **Charts**: Recharts 2.15.4
- **Form Handling**: React Hook Form 7.61.1 + Zod 3.25.76

### Frontend Server Configuration
- **Port**: 8080 (configured in `vite.config.ts`)
- **Base URL**: `http://localhost:8080` (frontend)
- **API Base URL**: `http://localhost:3000` (default, configurable via `VITE_API_URL` env var)

## API Client Configuration

### Base Configuration
- **Base URL**: `http://localhost:3000` (or from `VITE_API_URL` environment variable)
- **Timeout**: 10 seconds
- **Content-Type**: `application/json`
- **Authentication**: Bearer token in `Authorization` header
- **Token Storage**: `localStorage.getItem('authToken')` and `localStorage.setItem('authToken', token)`

### Request Interceptor
- Automatically adds `Authorization: Bearer {token}` header from localStorage
- Token is stored as `authToken` in localStorage

### Response Interceptor
- On 401 (Unauthorized): Removes token from localStorage and redirects to `/login`

## API Endpoints Required

### Authentication Endpoints

#### POST `/api/auth/signup`
**Request Body:**
```typescript
{
  name: string;        // Full name
  email: string;        // Email address
  password: string;    // Password
}
```

**Expected Response:**
```typescript
{
  token: string;       // JWT or auth token
  user?: {
    id: string;
    name: string;
    email: string;
  }
}
```

**Frontend Usage**: `src/pages/Signup.tsx` - Creates new user account

#### POST `/api/auth/login`
**Request Body:**
```typescript
{
  email: string;       // Email address
  password: string;    // Password
}
```

**Expected Response:**
```typescript
{
  token: string;       // JWT or auth token
  user?: {
    id: string;
    name: string;
    email: string;
  }
}
```

**Frontend Usage**: `src/pages/Login.tsx` - Authenticates user

### Wallet Endpoints

#### GET `/api/wallet/balance`
**Headers**: `Authorization: Bearer {token}`

**Expected Response:**
```typescript
{
  balance: number;     // Current wallet balance (e.g., 1234.56)
}
```

**Frontend Usage**: `src/pages/Dashboard.tsx` - Displays user balance

#### POST `/api/wallet/deposit`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
```typescript
{
  amount: number;      // Deposit amount (e.g., 500.00)
}
```

**Expected Response:**
```typescript
{
  success: boolean;
  newBalance: number;
  transactionId?: string;
  message?: string;
}
```

**Frontend Usage**: `src/pages/AddMoney.tsx` - Adds money to wallet

#### POST `/api/wallet/send`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
```typescript
{
  recipient: string;   // Email or username of recipient
  amount: number;      // Amount to send
  note?: string;       // Optional note/message
}
```

**Expected Response:**
```typescript
{
  success: boolean;
  transactionId: string;
  newBalance: number;
  message?: string;
}
```

**Frontend Usage**: `src/pages/SendPayment.tsx` - Sends payment to another user

### Activity/Transaction Endpoints

#### GET `/api/activity`
**Headers**: `Authorization: Bearer {token}`

**Query Parameters:**
```typescript
{
  limit?: number;     // Number of transactions to return
  offset?: number;    // Pagination offset
  type?: 'deposit' | 'send' | 'receive' | 'split' | 'request';
}
```

**Expected Response:**
```typescript
{
  transactions: Transaction[];
  total?: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'send' | 'receive' | 'split' | 'request';
  amount: number;
  recipient?: string;        // Name or email of recipient
  sender?: string;          // Name or email of sender
  date: string;             // ISO date string or formatted date
  status: 'completed' | 'pending' | 'failed';
  note?: string;
}
```

**Frontend Usage**: `src/pages/Dashboard.tsx` - Displays transaction history

### Payment Request Endpoints (To Be Implemented)

The frontend has payment request functionality but currently uses mock data. The following endpoints should be created:

#### POST `/api/payment-requests`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
```typescript
{
  amount: number;
  recipientName: string;    // Name or email of person to request from
  note?: string;
}
```

**Expected Response:**
```typescript
{
  requestId: string;        // Unique ID for the payment request
  link: string;             // Full URL: `${origin}/pay/${requestId}`
  expiresAt?: string;      // Optional expiration date
}
```

**Frontend Usage**: `src/pages/RequestPayment.tsx` - Creates payment request link

#### GET `/api/payment-requests/:requestId`
**Headers**: Optional (public endpoint for payment links)

**Expected Response:**
```typescript
{
  requestId: string;
  amount: number;
  note?: string;
  requestedBy: string;     // Name of requester
  requestedByEmail: string; // Email of requester
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
}
```

**Frontend Usage**: `src/pages/PaymentRequestView.tsx` - Displays payment request details

#### POST `/api/payment-requests/:requestId/pay`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
```typescript
{
  // No body needed, requestId in URL is sufficient
}
```

**Expected Response:**
```typescript
{
  success: boolean;
  transactionId: string;
  newBalance: number;
  message?: string;
}
```

**Frontend Usage**: `src/pages/PaymentRequestView.tsx` - Pays a payment request

### Split Payment Endpoint (To Be Implemented)

#### POST `/api/wallet/split-payment`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
```typescript
{
  totalAmount: number;
  participants: Array<{
    name: string;           // Email or username
    amount: number;        // Individual amount (for custom split)
  }>;
  splitMode: 'equal' | 'custom';
  note?: string;
}
```

**Expected Response:**
```typescript
{
  success: boolean;
  transactions: Array<{
    transactionId: string;
    recipient: string;
    amount: number;
  }>;
  newBalance: number;
}
```

**Frontend Usage**: `src/pages/SplitPayment.tsx` - Splits payment among multiple recipients

## Data Models

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string;
  userId: string;              // User who initiated the transaction
  type: 'deposit' | 'send' | 'receive' | 'split' | 'request';
  amount: number;              // Always positive, use type to determine direction
  recipientId?: string;        // User ID of recipient (for send/split)
  recipientEmail?: string;     // Email of recipient (for display)
  recipientName?: string;      // Name of recipient (for display)
  senderId?: string;           // User ID of sender (for receive)
  senderEmail?: string;        // Email of sender (for display)
  senderName?: string;         // Name of sender (for display)
  status: 'completed' | 'pending' | 'failed';
  note?: string;
  createdAt: string;           // ISO 8601 date string
  updatedAt?: string;
}
```

### Payment Request Model
```typescript
interface PaymentRequest {
  id: string;                  // Unique request ID (used in URL)
  requesterId: string;         // User ID who created the request
  requesterName: string;
  requesterEmail: string;
  amount: number;
  note?: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paidBy?: string;             // User ID who paid
  paidAt?: string;             // ISO 8601 date string
  createdAt: string;
  expiresAt?: string;          // Optional expiration
}
```

### Wallet Model
```typescript
interface Wallet {
  userId: string;
  balance: number;             // Current balance
  currency?: string;           // Default: 'USD'
  updatedAt: string;
}
```

## Frontend Routes

The frontend uses React Router with the following routes:

- `/` → Redirects to `/login`
- `/login` → Login page
- `/signup` → Signup page
- `/dashboard` → Main dashboard (protected)
- `/add-money` → Deposit funds page (protected)
- `/send-payment` → Send payment page (protected)
- `/split-payment` → Split payment page (protected)
- `/request-payment` → Create payment request page (protected)
- `/pay/:requestId` → View and pay payment request (public/protected)
- `*` → 404 Not Found page

## Authentication Flow

1. User signs up or logs in
2. Backend returns a token
3. Frontend stores token in `localStorage.setItem('authToken', token)`
4. All subsequent requests include `Authorization: Bearer {token}` header
5. On 401 response, frontend removes token and redirects to `/login`

## Error Handling

### Expected Error Response Format
```typescript
{
  error: string;               // Error message
  message?: string;             // Additional error details
  statusCode?: number;          // HTTP status code
  field?: string;               // Field name (for validation errors)
}
```

### Frontend Error Handling
- Uses toast notifications (via `useToast` hook)
- Displays error messages from API response
- 401 errors trigger automatic logout and redirect

## Current Frontend State

### What's Already Built
✅ Complete UI/UX with modern design
✅ All pages and components
✅ Routing structure
✅ API client with interceptors
✅ Form validation (client-side)
✅ Loading states and animations
✅ Responsive design
✅ Dark/light theme support (via next-themes)

### What's Mocked/Needs Backend
❌ All API calls currently use `setTimeout` to simulate API calls
❌ No real authentication
❌ No real data persistence
❌ Payment requests use random IDs (not from backend)
❌ Split payments not connected to backend
❌ Transaction history is hardcoded

## Integration Points

### Environment Variables
The frontend expects:
- `VITE_API_URL` (optional) - Defaults to `http://localhost:3000`

### CORS Configuration
Backend must allow:
- Origin: `http://localhost:8080` (frontend dev server)
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`
- Credentials: `true` (if using cookies)

### Response Format Standards
- All successful responses should return JSON
- Use HTTP status codes appropriately:
  - `200` - Success
  - `201` - Created
  - `400` - Bad Request (validation errors)
  - `401` - Unauthorized (invalid/missing token)
  - `403` - Forbidden (insufficient permissions)
  - `404` - Not Found
  - `500` - Internal Server Error

## Dashboard Data Requirements

The dashboard (`src/pages/Dashboard.tsx`) expects:

1. **Balance**: Current wallet balance
2. **Transactions**: Recent transaction history
3. **Charts Data** (currently hardcoded, but could be enhanced):
   - Weekly trend data
   - Category distribution (Income, Expenses, Savings)
   - Monthly comparison data

These chart data endpoints are optional but could be added:
- `GET /api/analytics/weekly-trend`
- `GET /api/analytics/category-distribution`
- `GET /api/analytics/monthly-comparison`

## Security Considerations

1. **Password Hashing**: Backend must hash passwords (never store plaintext)
2. **JWT/Token Expiration**: Implement token expiration and refresh mechanism
3. **Input Validation**: Validate all inputs on backend (don't trust frontend)
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Balance Validation**: Ensure users can't send more than their balance
6. **Transaction Atomicity**: Ensure wallet operations are atomic (use transactions)

## Testing Integration

When building the backend, test with:
1. Frontend running on `http://localhost:8080`
2. Backend running on `http://localhost:3000`
3. Use browser DevTools Network tab to see actual API calls
4. Check localStorage for token storage
5. Test all flows: signup → login → dashboard → transactions

## Notes for Backend Developer

1. **Don't create duplicate frontend code** - The entire UI is already built
2. **Match the API structure exactly** - The frontend expects these specific endpoints and response formats
3. **Use the same field names** - The frontend uses `balance`, `amount`, `recipient`, etc.
4. **Handle CORS properly** - Frontend runs on port 8080, backend on 3000
5. **Token format** - Frontend expects Bearer token in Authorization header
6. **Date formats** - Use ISO 8601 strings for dates, frontend will format for display
7. **Error messages** - Return user-friendly error messages in response
8. **Amount precision** - Handle currency amounts with 2 decimal places (cents)

## File Structure Reference

Key frontend files to understand:
- `src/api/client.js` - API client configuration and endpoints
- `src/pages/*.tsx` - All page components showing what data they need
- `src/components/TransactionItem.tsx` - Transaction display format
- `src/components/BalanceCard.tsx` - Balance display format
- `src/App.tsx` - Routing structure

## Next Steps for Backend

1. Set up Express/Fastify/NestJS server on port 3000
2. Implement authentication (JWT recommended)
3. Create database schema matching the data models above
4. Implement all API endpoints listed
5. Add input validation and error handling
6. Implement wallet balance logic (deposits increase, sends decrease)
7. Add transaction history tracking
8. Implement payment request system
9. Add split payment logic
10. Test integration with frontend

---

**Important**: The frontend is production-ready from a UI perspective. The backend should focus on implementing the API layer without modifying the frontend code. The frontend will automatically work once the backend endpoints are implemented according to this specification.

