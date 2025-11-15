# Arc Integration Guide

This application integrates Arc blockchain infrastructure for account linkage, analytics, and enhanced payment processing.

## Features

### Arc Account Linkage
- **Wallet Connection**: Link your blockchain wallet address to enable Arc services
- **Account Management**: Secure account linking with status tracking
- **Automatic Detection**: System automatically detects if account is already linked

### Arc Analytics
- **Transaction Analytics**: Comprehensive transaction metrics and statistics
- **Volume Tracking**: Track incoming and outgoing transaction volumes
- **Trend Analysis**: View transaction trends over time
- **Insights**: Get personalized insights and recommendations

### Arc APIs
- **Payment Processing**: Enhanced payment creation with Arc infrastructure
- **Event Tracking**: Track user events for analytics
- **Transaction History**: Access detailed transaction history
- **Account Insights**: Get risk scores and activity scores

## Setup

### 1. Get Arc API Key

1. Sign up at [Arc Network](https://arc.network) (or your Arc provider)
2. Create a new application
3. Copy your API key from the dashboard

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Arc API Configuration
ARC_API_KEY=your_arc_api_key_here
ARC_API_BASE=https://api.arc.network/v1

# For testnet/sandbox, use:
# ARC_API_BASE=https://api-sandbox.arc.network/v1
```

### 3. Restart Servers

After setting up environment variables, restart both servers:

```bash
# Backend
npm run server

# Frontend
npm run dev
```

## API Endpoints

### Backend Endpoints

- `POST /api/arc/account/link` - Link a wallet address to Arc account
- `GET /api/arc/account` - Get Arc account details
- `GET /api/arc/analytics` - Get analytics data (supports `?timeframe=30d`)
- `GET /api/arc/transactions` - Get transaction history (supports `?limit=50&offset=0`)
- `GET /api/arc/insights` - Get account insights and recommendations
- `POST /api/arc/payment` - Create a payment via Arc
- `GET /api/arc/payment/:paymentId` - Get payment status
- `POST /api/arc/events/track` - Track custom events

### Frontend API Client

```typescript
import { arcAPI } from '@/api/client';

// Link account
await arcAPI.linkAccount('0x...');

// Get account
await arcAPI.getAccount();

// Get analytics
await arcAPI.getAnalytics('30d'); // '7d', '30d', '90d', '1y'

// Get transactions
await arcAPI.getTransactions(50, 0);

// Get insights
await arcAPI.getInsights();

// Create payment
await arcAPI.createPayment({
  recipientAddress: '0x...',
  amount: 100,
  blockchain: 'ETH-SEPOLIA',
  note: 'Payment note'
});

// Get payment status
await arcAPI.getPaymentStatus('payment-id');

// Track event
await arcAPI.trackEvent('custom_event', { data: 'value' });
```

## Usage

### Linking Your Account

1. Navigate to Dashboard
2. If not linked, you'll see the "Link Arc Account" card
3. Enter your wallet address (must be valid 0x address)
4. Click "Link Account"
5. Once linked, analytics will automatically load

### Viewing Analytics

Once your account is linked:
- Analytics automatically load on dashboard
- View transaction counts and volumes
- See insights and recommendations
- Track trends over time

### Using Arc Payments

Arc payments provide enhanced features:
- Better transaction tracking
- Automatic event tracking
- Enhanced analytics integration
- Improved status monitoring

## Analytics Data Structure

```typescript
{
  timeframe: '30d',
  transactions: {
    total: 1500.00,
    count: 25,
    average: 60.00
  },
  volume: {
    total: 5000.00,
    incoming: 3500.00,
    outgoing: 1500.00
  },
  trends: [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 150 }
  ],
  insights: [
    {
      type: 'recommendation',
      message: 'Consider setting up automatic savings'
    }
  ]
}
```

## Event Tracking

Track custom events for analytics:

```typescript
// Track a custom event
await arcAPI.trackEvent('button_clicked', {
  buttonName: 'send_payment',
  page: 'dashboard'
});

// Common event types:
// - 'account_linked'
// - 'payment_created'
// - 'dashboard_viewed'
// - 'transaction_completed'
```

## Account Insights

Get personalized insights:

```typescript
{
  recommendations: [
    {
      type: 'savings',
      message: 'You could save $200/month'
    }
  ],
  riskScore: 75, // 0-100
  activityScore: 85, // 0-100
  trends: [...]
}
```

## Troubleshooting

### "Arc account not found"
- Ensure you've linked your account first
- Check that wallet address is valid
- Verify API key is set correctly

### "Failed to link Arc account"
- Verify `ARC_API_KEY` is set correctly
- Check API key permissions in Arc Console
- Ensure wallet address format is correct (0x...)

### Analytics not loading
- Account must be linked first
- Check browser console for errors
- Verify API endpoint is accessible

## Benefits

- **Enhanced Analytics**: Deep insights into your transaction patterns
- **Better Tracking**: Comprehensive event and transaction tracking
- **Smart Insights**: AI-powered recommendations
- **Security**: Enhanced monitoring and risk assessment
- **Integration**: Seamless integration with existing wallet features

## Resources

- [Arc Network Documentation](https://docs.arc.network)
- [Arc API Reference](https://api.arc.network/docs)
- [Arc Console](https://console.arc.network)

