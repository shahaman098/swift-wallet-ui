# Balance & Transaction Verification Guide

## ✅ How Balance Updates Work

### When You Add Money:
1. User enters amount and clicks "Add Money"
2. Frontend calls `walletAPI.deposit({ amount })`
3. Backend:
   - Updates wallet balance in MongoDB: `balance += amount`
   - Creates transaction record in MongoDB
   - Returns new balance
4. Frontend shows success with new balance
5. Dashboard automatically refreshes when you return

### When You Send Money:
1. User enters recipient and amount, clicks "Send Payment"
2. Frontend calls `walletAPI.send({ recipient, amount, note })`
3. Backend:
   - Checks balance in MongoDB
   - Updates sender wallet: `balance -= amount`
   - Updates recipient wallet: `balance += amount` (if user found)
   - Creates send transaction for sender
   - Creates receive transaction for recipient
   - Returns new balance
4. Frontend shows success with new balance
5. Dashboard automatically refreshes when you return

## 🔍 Verifying Balance Updates

### Test Flow:
1. **Check initial balance**
   - Login to dashboard
   - Note your current balance

2. **Add money**
   - Go to "Add Money"
   - Add $100
   - See success message with new balance
   - Return to dashboard
   - Balance should show +$100

3. **Send money**
   - Go to "Send Payment"
   - Send $50 to another user
   - See success message with new balance
   - Return to dashboard
   - Balance should show -$50 from previous

4. **Check transaction history**
   - Click "View All Transactions"
   - See both transactions listed
   - Filter by type if needed

## 📊 Database Verification

### Check MongoDB:
```bash
mongosh
use treasury

# Check wallet balance
db.wallets.find().pretty()

# Check transactions
db.transactions.find().sort({ createdAt: -1 }).limit(10).pretty()
```

### Expected Results:
- Wallet balance matches what you see in UI
- Transactions are recorded with correct amounts
- Transaction types are correct (deposit, send, receive)
- Dates are accurate

## 🐛 Troubleshooting

### Balance doesn't update after adding money:
- Check browser console for errors
- Verify backend is running
- Check MongoDB connection
- Verify API response includes `newBalance`

### Balance doesn't decrease after sending:
- Check if you have sufficient balance
- Verify recipient exists
- Check backend logs for errors
- Verify transaction was created in MongoDB

### Transactions not showing:
- Make sure you're logged in
- Check MongoDB: `db.transactions.find()`
- Verify API endpoint is working
- Check browser network tab

### Dashboard shows old balance:
- Refresh the page (F5)
- Check if balance API is being called
- Verify wallet exists in MongoDB
- Check for API errors in console

## ✅ Expected Behavior

### After Adding Money:
- ✅ Balance increases by exact amount
- ✅ Transaction appears in history
- ✅ Dashboard shows new balance immediately
- ✅ Transaction type is "deposit"

### After Sending Money:
- ✅ Balance decreases by exact amount
- ✅ Transaction appears in history
- ✅ Dashboard shows new balance immediately
- ✅ Transaction type is "send"
- ✅ Recipient receives money (if user exists)

### Transaction History:
- ✅ Shows all transactions
- ✅ Correct amounts
- ✅ Correct dates
- ✅ Correct types
- ✅ Filters work
- ✅ Pagination works

## 🧪 Quick Test

1. Login
2. Note balance (e.g., $0)
3. Add $100 → Balance should be $100
4. Send $30 → Balance should be $70
5. View transactions → Should see both
6. Check MongoDB → Should match UI

---

**All balance operations now use MongoDB and update correctly!** ✅

