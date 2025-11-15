import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/app.js';
import { DataStore } from '../server/store.js';

let server;
let baseUrl;
let store;

before(async () => {
  store = new DataStore();
  await store.reset();
  server = createApp(store);
  server.listen(0);
  await once(server, 'listening');
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) {
    return;
  }
  server.close();
  await once(server, 'close');
});

beforeEach(async () => {
  await store.reset();
});

async function post(path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  return { status: response.status, body: json };
}

async function get(path, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const json = await response.json();
  return { status: response.status, body: json };
}

test('user can sign up for a new account', async () => {
  const result = await post('/api/auth/signup', {
    name: 'Test User',
    email: 'user@example.com',
    password: 'password123',
  });

  assert.equal(result.status, 201);
  assert.ok(result.body.token);
  assert.equal(result.body.user.email, 'user@example.com');
  assert.equal(result.body.user.balance, 0);
});

test('duplicate email signups are rejected', async () => {
  await post('/api/auth/signup', {
    name: 'Existing',
    email: 'dupe@example.com',
    password: 'password123',
  });

  const result = await post('/api/auth/signup', {
    name: 'Duplicate',
    email: 'dupe@example.com',
    password: 'password123',
  });

  assert.equal(result.status, 409);
  assert.match(result.body.message, /already exists/i);
});

test('user can login with valid credentials', async () => {
  await post('/api/auth/signup', {
    name: 'Login User',
    email: 'login@example.com',
    password: 'password123',
  });

  const result = await post('/api/auth/login', {
    email: 'login@example.com',
    password: 'password123',
  });

  assert.equal(result.status, 200);
  assert.ok(result.body.token);
  assert.equal(result.body.user.email, 'login@example.com');
  assert.equal(result.body.user.balance, 0);
  assert.ok(!result.body.user.password);
});

test('balance endpoint returns the current balance', async () => {
  const signup = await post('/api/auth/signup', {
    name: 'Balance User',
    email: 'balance@example.com',
    password: 'password123',
  });

  const result = await get('/api/wallet/balance', signup.body.token);
  assert.equal(result.status, 200);
  assert.equal(result.body.balance, 0);
});

test('deposit increases balance and records transaction', async () => {
  const signup = await post('/api/auth/signup', {
    name: 'Deposit User',
    email: 'deposit@example.com',
    password: 'password123',
  });

  const deposit = await post(
    '/api/wallet/deposit',
    { amount: 150.25, note: 'Initial funding' },
    signup.body.token
  );

  assert.equal(deposit.status, 201);
  assert.equal(deposit.body.balance, 150.25);
  assert.equal(deposit.body.transaction.type, 'deposit');
  assert.equal(deposit.body.transaction.amount, 150.25);
  assert.equal(deposit.body.transaction.balanceAfter, 150.25);
});

test('sending without sufficient balance fails', async () => {
  const signup = await post('/api/auth/signup', {
    name: 'Sender',
    email: 'sender@example.com',
    password: 'password123',
  });

  const result = await post(
    '/api/wallet/send',
    { amount: 50, recipient: 'friend@example.com' },
    signup.body.token
  );

  assert.equal(result.status, 400);
  assert.match(result.body.message, /insufficient/i);
});

test('sending funds reduces balance and records transaction', async () => {
  const signup = await post('/api/auth/signup', {
    name: 'Sender',
    email: 'sender@example.com',
    password: 'password123',
  });

  await post(
    '/api/wallet/deposit',
    { amount: 200 },
    signup.body.token
  );

  const send = await post(
    '/api/wallet/send',
    { amount: 75, recipient: 'friend@example.com', note: 'Dinner' },
    signup.body.token
  );

  assert.equal(send.status, 201);
  assert.equal(send.body.balance, 125);
  assert.equal(send.body.transaction.type, 'send');
  assert.equal(send.body.transaction.recipient, 'friend@example.com');
});

test('activity endpoint returns recent transactions in order', async () => {
  const signup = await post('/api/auth/signup', {
    name: 'Activity',
    email: 'activity@example.com',
    password: 'password123',
  });

  await post(
    '/api/wallet/deposit',
    { amount: 100 },
    signup.body.token
  );

  await post(
    '/api/wallet/send',
    { amount: 40, recipient: 'coffee@example.com' },
    signup.body.token
  );

  const activity = await get('/api/activity?limit=5', signup.body.token);

  assert.equal(activity.status, 200);
  assert.equal(activity.body.transactions.length, 2);
  assert.equal(activity.body.transactions[0].type, 'send');
  assert.equal(activity.body.transactions[1].type, 'deposit');
});
