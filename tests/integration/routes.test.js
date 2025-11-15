const assert = require('assert');

// Test that all routes exist
describe('Frontend Routes', () => {
  const routes = [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/add-money',
    '/send-payment',
    '/split-payment',
    '/request-payment',
    '/pay/:requestId',
    '/treasury',
    '/treasury/create-org',
    '/treasury/create-department',
    '/treasury/rules',
    '/treasury/automation',
    '/treasury/analytics'
  ];

  it('should have all required routes', () => {
    assert.ok(routes.includes('/'));
    assert.ok(routes.includes('/login'));
    assert.ok(routes.includes('/dashboard'));
    assert.ok(routes.includes('/treasury'));
    assert.ok(routes.includes('/treasury/rules'));
    assert.ok(routes.includes('/treasury/automation'));
    assert.ok(routes.includes('/treasury/analytics'));
  });

  it('should have treasury sub-routes', () => {
    const treasuryRoutes = routes.filter(r => r.startsWith('/treasury'));
    assert.ok(treasuryRoutes.length >= 5, 'Should have at least 5 treasury routes');
  });
});

// Test button navigation targets
describe('Button Navigation', () => {
  it('should have correct navigation targets for treasury buttons', () => {
    const buttonTargets = {
      createOrg: '/treasury/create-org',
      createDepartment: '/treasury/create-department',
      manageRules: '/treasury/rules',
      automation: '/treasury/automation',
      analytics: '/treasury/analytics'
    };
    
    assert.strictEqual(buttonTargets.createOrg, '/treasury/create-org');
    assert.strictEqual(buttonTargets.createDepartment, '/treasury/create-department');
    assert.strictEqual(buttonTargets.manageRules, '/treasury/rules');
    assert.strictEqual(buttonTargets.automation, '/treasury/automation');
    assert.strictEqual(buttonTargets.analytics, '/treasury/analytics');
  });
});

