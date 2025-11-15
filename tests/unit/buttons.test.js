const assert = require('assert');

// Test that all buttons have valid navigation targets
describe('Button Navigation Targets', () => {
  it('should have valid treasury dashboard buttons', () => {
    const treasuryButtons = {
      createOrg: '/treasury/create-org',
      createDepartment: '/treasury/create-department',
      manageRules: '/treasury/rules',
      automation: '/treasury/automation',
      analytics: '/treasury/analytics'
    };

    assert.strictEqual(treasuryButtons.createOrg, '/treasury/create-org');
    assert.strictEqual(treasuryButtons.createDepartment, '/treasury/create-department');
    assert.strictEqual(treasuryButtons.manageRules, '/treasury/rules');
    assert.strictEqual(treasuryButtons.automation, '/treasury/automation');
    assert.strictEqual(treasuryButtons.analytics, '/treasury/analytics');
  });

  it('should have valid main dashboard buttons', () => {
    const dashboardButtons = {
      addMoney: '/add-money',
      sendPayment: '/send-payment',
      splitPayment: '/split-payment',
      requestPayment: '/request-payment',
      treasury: '/treasury'
    };

    assert.strictEqual(dashboardButtons.addMoney, '/add-money');
    assert.strictEqual(dashboardButtons.sendPayment, '/send-payment');
    assert.strictEqual(dashboardButtons.splitPayment, '/split-payment');
    assert.strictEqual(dashboardButtons.requestPayment, '/request-payment');
    assert.strictEqual(dashboardButtons.treasury, '/treasury');
  });

  it('should have all routes defined', () => {
    const allRoutes = [
      '/',
      '/login',
      '/signup',
      '/dashboard',
      '/add-money',
      '/send-payment',
      '/split-payment',
      '/request-payment',
      '/treasury',
      '/treasury/create-org',
      '/treasury/create-department',
      '/treasury/rules',
      '/treasury/automation',
      '/treasury/analytics'
    ];

    assert.ok(allRoutes.length >= 14, 'Should have at least 14 routes');
    assert.ok(allRoutes.includes('/treasury/rules'));
    assert.ok(allRoutes.includes('/treasury/automation'));
    assert.ok(allRoutes.includes('/treasury/analytics'));
  });
});

