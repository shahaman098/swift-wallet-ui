import http from 'node:http';
import { URL } from 'node:url';
import { DataStore } from './store.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from './auth.js';
import {
  setCorsHeaders,
  sendJson,
  formatTransaction,
  formatUser,
  parseJsonBody,
} from './utils.js';

async function authenticate(req, res, store) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.toString().startsWith('Bearer ')) {
    sendJson(res, 401, { message: 'Authentication required' });
    return null;
  }

  const token = header.toString().slice(7).trim();

  try {
    const { userId } = verifyToken(token);
    const user = await store.getUserById(userId);
    if (!user) {
      sendJson(res, 401, { message: 'User not found' });
      return null;
    }

    return user;
  } catch (error) {
    sendJson(res, 401, { message: 'Invalid or expired token' });
    return null;
  }
}

function handleError(error, res) {
  // eslint-disable-next-line no-console
  console.error(error);
  sendJson(res, 500, {
    message: 'An unexpected error occurred. Please try again later.',
  });
}

export function createApp(store = new DataStore()) {
  const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const method = req.method || 'GET';
    const url = new URL(req.url || '/', 'http://localhost');

    try {
      if (method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok' });
        return;
      }

      if (method === 'POST' && url.pathname === '/api/auth/signup') {
        const body = await parseJsonBody(req);
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';

        if (!name || !email || !password) {
          sendJson(res, 400, {
            message: 'Name, email and password are required',
          });
          return;
        }

        const existingUser = await store.findUserByEmail(email);
        if (existingUser) {
          sendJson(res, 409, { message: 'An account with this email already exists' });
          return;
        }

        const user = await store.createUser({
          name,
          email,
          passwordHash: hashPassword(password),
        });

        const token = generateToken(user.id);

        sendJson(res, 201, { token, user: formatUser(user) });
        return;
      }

      if (method === 'POST' && url.pathname === '/api/auth/login') {
        const body = await parseJsonBody(req);
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';

        if (!email || !password) {
          sendJson(res, 400, { message: 'Email and password are required' });
          return;
        }

        let user = await store.findUserByEmail(email);
        
        // If user doesn't exist, auto-register them
        if (!user) {
          // Generate a name from email (e.g., "john.doe@example.com" -> "John Doe")
          const emailParts = email.split('@')[0];
          const nameParts = emailParts.split(/[._-]/);
          const name = nameParts
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ') || emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
          
          user = await store.createUser({
            name,
            email,
            passwordHash: hashPassword(password),
          });
          
          const token = generateToken(user.id);
          sendJson(res, 201, { 
            token, 
            user: formatUser(user),
            message: 'Account created and logged in successfully'
          });
          return;
        }

        // User exists, verify password
        if (!verifyPassword(password, user.passwordHash)) {
          sendJson(res, 401, { message: 'Invalid password' });
          return;
        }

        const token = generateToken(user.id);
        sendJson(res, 200, { token, user: formatUser(user) });
        return;
      }

      if (method === 'GET' && url.pathname === '/api/wallet/balance') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        sendJson(res, 200, { balance: user.balance });
        return;
      }

      if (method === 'POST' && url.pathname === '/api/wallet/deposit') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const amount = Number(body.amount);
        const note = typeof body.note === 'string' ? body.note.trim() : undefined;

        if (!Number.isFinite(amount) || amount <= 0) {
          sendJson(res, 400, { message: 'Deposit amount must be greater than zero' });
          return;
        }

        // Reload user to get latest balance (prevents race conditions)
        const currentUser = await store.getUserById(user.id);
        if (!currentUser) {
          sendJson(res, 404, { message: 'User not found' });
          return;
        }

        const updatedUser = await store.updateUserBalance(
          currentUser.id,
          currentUser.balance + amount
        );

        if (!updatedUser) {
          sendJson(res, 404, { message: 'User not found' });
          return;
        }

        const transaction = await store.addTransaction({
          userId: currentUser.id,
          type: 'deposit',
          amount,
          balanceAfter: updatedUser.balance,
          note,
        });

        sendJson(res, 201, {
          balance: updatedUser.balance,
          transaction: formatTransaction(transaction),
        });
        return;
      }

      if (method === 'POST' && url.pathname === '/api/wallet/send') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const amount = Number(body.amount);
        const recipient = typeof body.recipient === 'string' ? body.recipient.trim() : '';
        const note = typeof body.note === 'string' ? body.note.trim() : undefined;

        if (!Number.isFinite(amount) || amount <= 0) {
          sendJson(res, 400, { message: 'Send amount must be greater than zero' });
          return;
        }

        if (!recipient) {
          sendJson(res, 400, { message: 'Recipient is required' });
          return;
        }

        // Reload user to get latest balance (prevents race conditions)
        const currentUser = await store.getUserById(user.id);
        if (!currentUser) {
          sendJson(res, 404, { message: 'User not found' });
          return;
        }

        if (currentUser.balance < amount) {
          sendJson(res, 400, { message: 'Insufficient funds' });
          return;
        }

        const updatedUser = await store.updateUserBalance(
          currentUser.id,
          currentUser.balance - amount
        );

        if (!updatedUser) {
          sendJson(res, 404, { message: 'User not found' });
          return;
        }

        const transaction = await store.addTransaction({
          userId: currentUser.id,
          type: 'send',
          amount,
          recipient,
          note,
          balanceAfter: updatedUser.balance,
        });

        sendJson(res, 201, {
          balance: updatedUser.balance,
          transaction: formatTransaction(transaction),
        });
        return;
      }

      if (method === 'GET' && url.pathname === '/api/activity') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const limitParam = url.searchParams.get('limit');
        const limit = Number(limitParam);
        const transactions = await store.getTransactionsForUser(
          user.id,
          Number.isFinite(limit) ? limit : undefined
        );

        sendJson(res, 200, {
          transactions: transactions.map((transaction) =>
            formatTransaction(transaction)
          ),
        });
        return;
      }

      sendJson(res, 404, { message: 'Not Found' });
    } catch (error) {
      if (error.message === 'Invalid JSON payload' || error.message === 'Request body too large') {
        sendJson(res, 400, { message: error.message });
        return;
      }

      handleError(error, res);
    }
  });

  server.store = store;
  return server;
}
