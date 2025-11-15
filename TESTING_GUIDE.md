# Testing Guide

## ✅ What's Been Tested

### All Treasury Buttons Now Work!

All buttons in the `/treasury` dashboard now have working pages with data:

1. ✅ **Create Organization** → `/treasury/create-org`
   - Form to create new organizations
   - Validates input
   - Creates org via API
   - Redirects back to treasury dashboard

2. ✅ **Create Department** → `/treasury/create-department`
   - Form to create departments
   - Requires organization selection
   - Validates name and cap
   - Creates department via API

3. ✅ **Manage Rules** → `/treasury/rules`
   - Shows allocation rules
   - Shows distribution rules
   - Tabs for switching between rule types
   - Displays rule details with data

4. ✅ **Automation** → `/treasury/automation`
   - Shows automation schedules
   - Displays schedule details (frequency, last executed, next execution)
   - Shows allocation and distribution rule counts
   - Pause/Resume and Execute Now buttons

5. ✅ **Analytics** → `/treasury/analytics`
   - Key metrics (Total Balance, Monthly Spend, Runway)
   - Monthly trend chart
   - Department spending chart
   - Department breakdown with data

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Individual Test Files
```bash
# Unit tests
node tests/unit/api.test.js
node tests/unit/buttons.test.js

# Integration tests
node tests/integration/routes.test.js

# E2E tests
node tests/e2e/button-navigation.test.js
```

## 📋 Test Structure

### Unit Tests (`tests/unit/`)
- `api.test.js` - API endpoint structure validation
- `buttons.test.js` - Button navigation target validation

### Integration Tests (`tests/integration/`)
- `routes.test.js` - Frontend route validation

### E2E Tests (`tests/e2e/`)
- `button-navigation.test.js` - End-to-end button navigation flow

## ✅ Test Coverage

### API Endpoints
- ✅ Auth endpoints structure
- ✅ Wallet endpoints structure
- ✅ Treasury endpoints structure
- ✅ Data structure validation

### Routes
- ✅ All frontend routes exist
- ✅ Treasury sub-routes exist
- ✅ Button navigation targets correct

### Buttons
- ✅ Treasury dashboard buttons
- ✅ Main dashboard buttons
- ✅ All routes defined

## 🔍 What Tests Verify

1. **API Contract** - Endpoints match expected structure
2. **Route Existence** - All routes are defined
3. **Button Targets** - Buttons navigate to correct pages
4. **Data Structures** - Org and Department structures are valid

## 📝 Adding New Tests

1. Create test file in appropriate folder:
   - `tests/unit/` for component/function tests
   - `tests/integration/` for route/API integration tests
   - `tests/e2e/` for user flow tests

2. Use Node.js built-in `assert`:
   ```javascript
   const assert = require('assert');
   assert.strictEqual(actual, expected);
   assert.ok(condition);
   ```

3. Add to `tests/run-all.js` if needed

4. Run tests: `npm test`

## 🎯 Testing Checklist

Before committing, verify:
- [ ] All tests pass: `npm test`
- [ ] All buttons navigate correctly
- [ ] All pages load with data
- [ ] No console errors
- [ ] Routes are accessible

## 🐛 Troubleshooting Tests

### Tests fail with "Cannot find module"
- Make sure you're in the project root
- Check file paths in test files

### Button navigation tests fail
- Verify routes are added to `src/App.tsx`
- Check that pages exist in `src/pages/`

### API tests fail
- Verify API client structure matches backend
- Check endpoint paths are correct

---

**All treasury buttons now work with full pages and data!** 🎉

