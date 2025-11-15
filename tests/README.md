# Testing Guide

## Running Tests

### All Tests
```bash
node tests/run-all.js
```

### Unit Tests
```bash
node tests/unit/api.test.js
```

### Integration Tests
```bash
node tests/integration/routes.test.js
```

### E2E Tests
```bash
node tests/e2e/button-navigation.test.js
```

## Test Structure

- `tests/unit/` - Unit tests for individual components
- `tests/integration/` - Integration tests for routes and APIs
- `tests/e2e/` - End-to-end tests for user flows

## Using Assert

All tests use Node.js built-in `assert` module:

```javascript
const assert = require('assert');

assert.strictEqual(actual, expected);
assert.ok(condition);
assert.deepStrictEqual(actual, expected);
```

## Adding New Tests

1. Create test file in appropriate folder
2. Use `assert` for assertions
3. Follow existing test structure
4. Run tests before committing

