import http from 'node:http';
import { URL } from 'node:url';
import { DataStore } from './store.js';
import { DatabaseStore } from './db-store.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from './auth.js';
import { DataPipeline } from './data-pipeline.js';
import { KycKybService } from './kyc-kyb.js';
import { SanctionsScreeningService } from './sanctions-screening.js';
import { PaymentStateMachine } from './payment-state-machine.js';
import { TelemetryService } from './telemetry.js';
import {
  setCorsHeaders,
  sendJson,
  formatTransaction,
  formatUser,
  parseJsonBody,
} from './utils.js';
import {
  getOrCreateWallet,
  getWalletBalance,
  createDepositAddress,
  createTransfer,
  initiateCCTPTransfer,
  getCCTPTransferStatus,
  requestCCTPAttestation,
} from './circle.js';
import { SUPPORTED_CHAINS, SETTLEMENT_STATES } from './chains.js';
import {
  linkArcAccount,
  getArcAccount,
  getArcAnalytics,
  trackEvent,
  getArcTransactions,
  createArcPayment,
  getPaymentStatus,
  getAccountInsights,
} from './arc.js';
import {
  deployTreasuryWallet,
  deployPolicyEngine,
  createSafeWallet,
  executeAllocation,
  executeDistribution,
  addPolicy as addPolicyToContract,
  createPolicy,
  evaluatePolicy,
  getTreasuryBalance,
  getWalletPolicies,
} from './smart-contracts.js';

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
  // Initialize services
  let sanctionsService, kycKybService, dataPipeline, telemetryService, paymentStateMachine;
  try {
    telemetryService = new TelemetryService(store);
    sanctionsService = new SanctionsScreeningService(store);
    kycKybService = new KycKybService(store);
    dataPipeline = new DataPipeline(store, sanctionsService, kycKybService);
    paymentStateMachine = new PaymentStateMachine(store, telemetryService);
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    // Services will be undefined, which will cause errors if used
    // But at least the server can start
  }

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
        const telemetryHealth = telemetryService ? telemetryService.getHealth() : null;
        sendJson(res, 200, { 
          status: 'ok',
          services: {
            telemetry: telemetryHealth,
            dataPipeline: !!dataPipeline,
            kycKyb: !!kycKybService,
            sanctions: !!sanctionsService,
            paymentStateMachine: !!paymentStateMachine,
          }
        });
        return;
      }

      // Telemetry & Observability Endpoints
      if (method === 'GET' && url.pathname === '/api/telemetry/metrics') {
        if (!telemetryService) {
          sendJson(res, 503, { message: 'Telemetry service not available' });
          return;
        }

        const metrics = telemetryService.getAllMetrics();
        sendJson(res, 200, { metrics });
        return;
      }

      if (method === 'POST' && url.pathname === '/api/telemetry/clear') {
        if (!telemetryService) {
          sendJson(res, 503, { message: 'Telemetry service not available' });
          return;
        }

        telemetryService.clearMetrics();
        sendJson(res, 200, { message: 'Metrics cleared' });
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

        // Process user registration through data pipeline
        if (dataPipeline) {
          try {
            await dataPipeline.processUserRegistration(user);
          } catch (error) {
            console.error('Pipeline processing error during signup:', error);
            // Continue with signup even if pipeline fails
          }
        }

        // Create audit log
        try {
          await store.createAuditLog({
            userId: user.id,
            action: 'create_user',
            entityType: 'user',
            entityId: user.id,
            changes: { email: user.email, name: user.name },
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }

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

        const user = await store.findUserByEmail(email);
        if (!user || !verifyPassword(password, user.passwordHash)) {
          sendJson(res, 401, { message: 'Invalid email or password' });
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

        const chainKey = url.searchParams.get('chain');
        
        if (chainKey) {
          // Get balance for specific chain
          const balance = await store.getChainBalance(user.id, chainKey);
          sendJson(res, 200, { 
            chain: chainKey,
            balance: balance || 0,
            chainId: SUPPORTED_CHAINS[chainKey]?.chainId || null,
          });
        } else {
          // Get all chain balances
          const balances = await store.getAllChainBalances(user.id);
          const totalBalance = Object.values(balances).reduce((sum, b) => sum + (b || 0), 0);
          
          sendJson(res, 200, { 
            balances,
            totalBalance,
            legacyBalance: user.balance, // For backward compatibility
          });
        }
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
        const chainKey = typeof body.chainKey === 'string' ? body.chainKey : 'ETH-SEPOLIA';

        if (!Number.isFinite(amount) || amount <= 0) {
          sendJson(res, 400, { message: 'Deposit amount must be greater than zero' });
          return;
        }

        if (!SUPPORTED_CHAINS[chainKey]) {
          sendJson(res, 400, { message: `Unsupported chain: ${chainKey}` });
          return;
        }

        // Update chain-specific balance
        const updatedUser = await store.updateChainBalance(user.id, chainKey, amount);

        if (!updatedUser) {
          sendJson(res, 404, { message: 'User not found' });
          return;
        }

        const chainBalance = await store.getChainBalance(user.id, chainKey);

        const transaction = await store.addTransaction({
          userId: user.id,
          type: 'deposit',
          amount,
          balanceAfter: chainBalance,
          note,
          chainKey,
          sourceChain: chainKey,
          settlementState: 'completed',
        });

        sendJson(res, 201, {
          balance: chainBalance,
          totalBalance: updatedUser.balance,
          chain: chainKey,
          chainId: SUPPORTED_CHAINS[chainKey].chainId,
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
        const sourceChain = typeof body.sourceChain === 'string' ? body.sourceChain : 'ETH-SEPOLIA';
        const destinationChain = typeof body.destinationChain === 'string' ? body.destinationChain : sourceChain;
        const useCCTP = body.useCCTP === true || (sourceChain !== destinationChain);

        // Start telemetry trace
        const traceId = telemetryService ? telemetryService.startTrace('payment_send', { userId: user.id }) : null;

        try {
          if (traceId && telemetryService) {
            telemetryService.addSpan(traceId, 'validation_start');
          }

          if (!Number.isFinite(amount) || amount <= 0) {
            sendJson(res, 400, { message: 'Send amount must be greater than zero' });
            if (traceId && telemetryService) await telemetryService.endTrace(traceId, false, { error: 'invalid_amount' });
            return;
          }

          if (!recipient) {
            sendJson(res, 400, { message: 'Recipient is required' });
            if (traceId && telemetryService) await telemetryService.endTrace(traceId, false, { error: 'missing_recipient' });
            return;
          }

          if (!SUPPORTED_CHAINS[sourceChain]) {
            sendJson(res, 400, { message: `Unsupported source chain: ${sourceChain}` });
            if (traceId && telemetryService) await telemetryService.endTrace(traceId, false, { error: 'invalid_chain' });
            return;
          }

          // Check chain-specific balance
          const sourceBalance = await store.getChainBalance(user.id, sourceChain);
          if (sourceBalance < amount) {
            sendJson(res, 400, { 
              message: `Insufficient funds on ${sourceChain}. Available: ${sourceBalance.toFixed(2)} USDC` 
            });
            if (traceId && telemetryService) await telemetryService.endTrace(traceId, false, { error: 'insufficient_funds' });
            return;
          }

          // Create payment with state machine
          let payment = null;
          if (paymentStateMachine && telemetryService) {
            payment = await paymentStateMachine.createPayment({
              userId: user.id,
              amount,
              recipient,
              sourceChain,
              destinationChain,
              note,
              metadata: { useCCTP, traceId },
            });

            // Transition to validating state
            await paymentStateMachine.transitionState(payment, 'validating');
            telemetryService.addSpan(traceId, 'payment_created', { paymentId: payment.id });
          }

          // Process transaction through data pipeline with retry logic
          let pipelineResult = null;
          if (dataPipeline && payment && paymentStateMachine) {
            try {
              const transactionData = {
                id: payment.id,
                userId: user.id,
                type: 'send',
                amount,
                recipient,
                note,
                chainKey: sourceChain,
                sourceChain,
                destinationChain,
              };

              pipelineResult = await paymentStateMachine.processWithRetry(
                payment,
                async () => {
                  const result = await dataPipeline.processTransaction(transactionData);
                  if (result && result.blocked) {
                    const error = new Error(
                      result.reason === 'sanctions_screening'
                        ? 'Transaction blocked due to sanctions screening'
                        : 'Transaction requires KYC verification'
                    );
                    error.pipelineResult = result;
                    throw error;
                  }
                  return result;
                },
                { maxRetries: 2 }
              );

              telemetryService.addSpan(traceId, 'pipeline_complete', { pipelineResult });
              await paymentStateMachine.transitionState(payment, 'processing');
            } catch (error) {
              console.error('Pipeline processing error:', error);
              
              if (error.pipelineResult && error.pipelineResult.blocked) {
                await paymentStateMachine.transitionState(payment, 'failed', {
                  error: error.message,
                  reason: error.pipelineResult.reason,
                });

                sendJson(res, 403, {
                  message: error.message,
                  reason: error.pipelineResult.reason,
                  details: error.pipelineResult,
                  paymentId: payment.id,
                  paymentState: payment.state,
                });

                if (traceId && telemetryService) await telemetryService.endTrace(traceId, false, { error: 'pipeline_blocked' });
                return;
              }
              
              // Pipeline failed but allow transaction to continue
              console.warn('Pipeline failed, continuing with transaction');
            }
          }

          // Update source chain balance (deduct)
          const updatedUser = await store.updateChainBalance(user.id, sourceChain, -amount);

          if (!updatedUser) {
            if (payment && paymentStateMachine) {
              await paymentStateMachine.transitionState(payment, 'failed', { error: 'user_not_found' });
            }
            sendJson(res, 404, { message: 'User not found' });
            if (traceId && telemetryService) await telemetryService.endTrace(traceId, false, { error: 'user_not_found' });
            return;
          }

          const chainBalance = await store.getChainBalance(user.id, sourceChain);
          const settlementState = useCCTP ? 'pending' : 'completed';

          // Transition payment state based on CCTP usage
          if (payment && paymentStateMachine) {
            if (useCCTP) {
              await paymentStateMachine.transitionState(payment, 'pending', { settlementState });
            } else {
              await paymentStateMachine.transitionState(payment, 'completed', { settlementState });
            }
          }

          // Get sanctions screening result if available
          const sanctionsResult = pipelineResult?.screeningResult || null;

          const transaction = await store.addTransaction({
            userId: user.id,
            type: 'send',
            amount,
            recipient,
            note,
            chainKey: sourceChain,
            sourceChain,
            destinationChain,
            settlementState,
            balanceAfter: chainBalance,
            sanctionsScreened: true,
            sanctionsResult: sanctionsResult,
          });

          telemetryService?.addSpan(traceId, 'transaction_created', { transactionId: transaction.id });

          // Create audit log
          try {
            await store.createAuditLog({
              userId: user.id,
              action: 'create_transaction',
              entityType: 'transaction',
              entityId: transaction.id,
              changes: { type: 'send', amount, recipient, chain: sourceChain },
              ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
            });
          } catch (error) {
            console.error('Audit log error:', error);
          }

          // End trace successfully
          if (traceId && telemetryService) {
            await telemetryService.endTrace(traceId, true, { 
              transactionId: transaction.id,
              paymentId: payment?.id,
              settlementState 
            });
          }

          sendJson(res, 201, {
            balance: chainBalance,
            totalBalance: updatedUser.balance,
            chain: sourceChain,
            sourceChain,
            destinationChain,
            settlementState,
            paymentId: payment?.id,
            paymentState: payment?.state,
            transaction: formatTransaction(transaction),
            message: useCCTP ? 'Cross-chain transfer initiated via CCTP' : 'Transfer completed',
          });
        } catch (error) {
          console.error('Send payment error:', error);
          if (traceId && telemetryService) {
            await telemetryService.endTrace(traceId, false, { error: error.message });
          }
          sendJson(res, 500, { message: error.message || 'Failed to process payment' });
        }
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

      // Circle Wallet Endpoints
      if (method === 'POST' && url.pathname === '/api/circle/wallet/create') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        try {
          // Check if user already has a wallet
          if (user.circleWalletId) {
            sendJson(res, 200, {
              walletId: user.circleWalletId,
              message: 'Wallet already exists',
            });
            return;
          }

          const wallet = await getOrCreateWallet(user.id, user.email);
          await store.updateUserCircleWallet(user.id, wallet.walletId);

          sendJson(res, 201, {
            walletId: wallet.walletId,
            address: wallet.address,
          });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/circle/wallet/balance') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.circleWalletId) {
          sendJson(res, 404, { message: 'Circle wallet not found. Please create a wallet first.' });
          return;
        }

        const chainKey = url.searchParams.get('chain');

        try {
          const balances = await getWalletBalance(user.circleWalletId, chainKey);
          
          // Sync balances to our store
          if (!chainKey) {
            // Update all chain balances
            for (const [chain, balance] of Object.entries(balances)) {
              const currentBalance = await store.getChainBalance(user.id, chain);
              if (currentBalance !== balance) {
                await store.updateChainBalance(user.id, chain, balance - (currentBalance || 0));
              }
            }
          } else {
            // Update single chain balance
            const balance = balances[chainKey] || 0;
            const currentBalance = await store.getChainBalance(user.id, chainKey);
            if (currentBalance !== balance) {
              await store.updateChainBalance(user.id, chainKey, balance - (currentBalance || 0));
            }
          }
          
          sendJson(res, 200, { 
            balances: chainKey ? { [chainKey]: balances[chainKey] || 0 } : balances,
            walletId: user.circleWalletId,
          });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/circle/wallet/deposit-address') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.circleWalletId) {
          sendJson(res, 404, { message: 'Circle wallet not found. Please create a wallet first.' });
          return;
        }

        const body = await parseJsonBody(req);
        const blockchain = typeof body.blockchain === 'string' ? body.blockchain : 'ETH-SEPOLIA';

        try {
          const depositInfo = await createDepositAddress(user.circleWalletId, blockchain);
          sendJson(res, 201, depositInfo);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/circle/wallet/deposit') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.circleWalletId) {
          sendJson(res, 404, { message: 'Circle wallet not found. Please create a wallet first.' });
          return;
        }

        const body = await parseJsonBody(req);
        const amount = Number(body.amount);
        const blockchain = typeof body.blockchain === 'string' ? body.blockchain : 'ETH-SEPOLIA';

        if (!Number.isFinite(amount) || amount <= 0) {
          sendJson(res, 400, { message: 'Deposit amount must be greater than zero' });
          return;
        }

        if (!SUPPORTED_CHAINS[blockchain]) {
          sendJson(res, 400, { message: `Unsupported blockchain: ${blockchain}` });
          return;
        }

        try {
          // Get deposit address
          const depositInfo = await createDepositAddress(user.circleWalletId, blockchain);
          
          // Record pending deposit transaction
          const transaction = await store.addTransaction({
            userId: user.id,
            type: 'deposit',
            amount,
            chainKey: blockchain,
            sourceChain: blockchain,
            settlementState: 'pending',
            note: body.note,
            balanceAfter: await store.getChainBalance(user.id, blockchain),
          });
          
          sendJson(res, 201, {
            depositAddress: depositInfo.address,
            blockchain: depositInfo.blockchain,
            chainId: SUPPORTED_CHAINS[blockchain].chainId,
            amount,
            transactionId: transaction.id,
            message: 'Deposit address created. Send USDC to this address. Balance will update once confirmed.',
          });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/circle/wallet/send') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.circleWalletId) {
          sendJson(res, 404, { message: 'Circle wallet not found. Please create a wallet first.' });
          return;
        }

        const body = await parseJsonBody(req);
        const amount = Number(body.amount);
        const destinationAddress = typeof body.destinationAddress === 'string' ? body.destinationAddress.trim() : '';
        const sourceChain = typeof body.sourceChain === 'string' ? body.sourceChain : 'ETH-SEPOLIA';
        const destinationChain = typeof body.destinationChain === 'string' ? body.destinationChain : sourceChain;
        const useCCTP = body.useCCTP === true || (sourceChain !== destinationChain);

        if (!Number.isFinite(amount) || amount <= 0) {
          sendJson(res, 400, { message: 'Send amount must be greater than zero' });
          return;
        }

        if (!destinationAddress) {
          sendJson(res, 400, { message: 'Destination address is required' });
          return;
        }

        // Check chain balance
        const sourceBalance = await store.getChainBalance(user.id, sourceChain);
        if (sourceBalance < amount) {
          sendJson(res, 400, { 
            message: `Insufficient funds on ${sourceChain}. Available: ${sourceBalance.toFixed(2)} USDC` 
          });
          return;
        }

        try {
          let transfer;
          let settlementState = 'completed';
          
          if (useCCTP && sourceChain !== destinationChain) {
            // Use CCTP for cross-chain transfer
            transfer = await initiateCCTPTransfer(
              user.circleWalletId,
              destinationAddress,
              amount,
              sourceChain,
              destinationChain
            );
            settlementState = transfer.settlementState || 'burning';
            
            // Update source chain balance (burn)
            await store.updateChainBalance(user.id, sourceChain, -amount);
          } else {
            // Regular same-chain transfer
            transfer = await createTransfer(
              user.circleWalletId,
              destinationAddress,
              amount,
              sourceChain
            );
            
            // Update source chain balance
            await store.updateChainBalance(user.id, sourceChain, -amount);
          }

          // Record transaction in our database with chain info
          const updatedUser = await store.getUserById(user.id);
          const transaction = await store.addTransaction({
            userId: user.id,
            type: 'send',
            amount,
            recipient: destinationAddress,
            note: body.note,
            chainKey: sourceChain,
            sourceChain,
            destinationChain,
            settlementState,
            cctpTransferId: useCCTP ? transfer.transferId : undefined,
            burnTxHash: transfer.burnTxHash || undefined,
            mintTxHash: transfer.mintTxHash || undefined,
            balanceAfter: await store.getChainBalance(user.id, sourceChain),
          });

          sendJson(res, 201, {
            transferId: transfer.transferId,
            status: transfer.status,
            settlementState,
            sourceChain,
            destinationChain,
            burnTxHash: transfer.burnTxHash || null,
            mintTxHash: transfer.mintTxHash || null,
            transaction: formatTransaction(transaction),
            message: useCCTP ? 'Cross-chain transfer initiated via CCTP' : 'Transfer initiated',
          });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname.startsWith('/api/circle/transfer/')) {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const transferId = url.pathname.split('/').pop();

        try {
          const status = await getCCTPTransferStatus(transferId);
          
          // Update transaction settlement state if it exists
          const transactions = await store.getTransactionsForUser(user.id, 100);
          const transaction = transactions.find(tx => tx.cctpTransferId === transferId);
          if (transaction) {
            await store.updateTransactionSettlement(transaction.id, status.settlementState, {
              burnTxHash: status.burnTxHash,
              mintTxHash: status.mintTxHash,
              attestation: status.attestation,
            });
          }

          sendJson(res, 200, status);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/chains') {
        // Return supported chains info
        const chains = Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => ({
          key,
          ...chain,
        }));
        sendJson(res, 200, { chains });
        return;
      }

      // Arc Account & Analytics Endpoints
      if (method === 'POST' && url.pathname === '/api/arc/account/link') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const walletAddress = typeof body.walletAddress === 'string' ? body.walletAddress.trim() : '';

        if (!walletAddress) {
          sendJson(res, 400, { message: 'Wallet address is required' });
          return;
        }

        try {
          // Check if user already has an Arc account
          if (user.arcAccountId) {
            const account = await getArcAccount(user.arcAccountId);
            sendJson(res, 200, {
              accountId: account.accountId,
              message: 'Arc account already linked',
            });
            return;
          }

          const arcAccount = await linkArcAccount(user.id, user.email, walletAddress);
          await store.updateUserArcAccount(user.id, arcAccount.arcAccountId);

          // Track account linkage event
          await trackEvent(arcAccount.arcAccountId, 'account_linked', {
            userId: user.id,
            walletAddress,
          });

          sendJson(res, 201, {
            accountId: arcAccount.arcAccountId,
            walletAddress: arcAccount.linkedWallet,
            status: arcAccount.status,
          });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/arc/account') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.arcAccountId) {
          sendJson(res, 404, { message: 'Arc account not found. Please link your account first.' });
          return;
        }

        try {
          const account = await getArcAccount(user.arcAccountId);
          sendJson(res, 200, account);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/arc/analytics') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.arcAccountId) {
          sendJson(res, 404, { message: 'Arc account not found. Please link your account first.' });
          return;
        }

        const timeframe = url.searchParams.get('timeframe') || '30d';

        try {
          const analytics = await getArcAnalytics(user.arcAccountId, timeframe);
          sendJson(res, 200, analytics);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/arc/transactions') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.arcAccountId) {
          sendJson(res, 404, { message: 'Arc account not found. Please link your account first.' });
          return;
        }

        const limit = Number(url.searchParams.get('limit')) || 50;
        const offset = Number(url.searchParams.get('offset')) || 0;

        try {
          const transactions = await getArcTransactions(user.arcAccountId, limit, offset);
          sendJson(res, 200, transactions);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/arc/insights') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.arcAccountId) {
          sendJson(res, 404, { message: 'Arc account not found. Please link your account first.' });
          return;
        }

        try {
          const insights = await getAccountInsights(user.arcAccountId);
          sendJson(res, 200, insights);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/arc/payment') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.arcAccountId) {
          sendJson(res, 404, { message: 'Arc account not found. Please link your account first.' });
          return;
        }

        const body = await parseJsonBody(req);
        const amount = Number(body.amount);
        const recipientAddress = typeof body.recipientAddress === 'string' ? body.recipientAddress.trim() : '';
        const blockchain = typeof body.blockchain === 'string' ? body.blockchain : 'ETH-SEPOLIA';
        const note = typeof body.note === 'string' ? body.note.trim() : undefined;

        if (!Number.isFinite(amount) || amount <= 0) {
          sendJson(res, 400, { message: 'Payment amount must be greater than zero' });
          return;
        }

        if (!recipientAddress) {
          sendJson(res, 400, { message: 'Recipient address is required' });
          return;
        }

        try {
          const payment = await createArcPayment(
            user.arcAccountId,
            recipientAddress,
            amount,
            blockchain,
            note
          );

          // Track payment event
          await trackEvent(user.arcAccountId, 'payment_created', {
            paymentId: payment.paymentId,
            amount,
            recipientAddress,
          });

          // Record transaction in our database
          const transaction = await store.addTransaction({
            userId: user.id,
            type: 'send',
            amount,
            recipient: recipientAddress,
            note,
            balanceAfter: user.balance - amount,
          });

          sendJson(res, 201, {
            paymentId: payment.paymentId,
            status: payment.status,
            transactionHash: payment.transactionHash,
            transaction: formatTransaction(transaction),
          });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname.startsWith('/api/arc/payment/')) {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const paymentId = url.pathname.split('/').pop();

        try {
          const payment = await getPaymentStatus(paymentId);
          sendJson(res, 200, payment);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/arc/events/track') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!user.arcAccountId) {
          sendJson(res, 404, { message: 'Arc account not found. Please link your account first.' });
          return;
        }

        const body = await parseJsonBody(req);
        const eventType = typeof body.eventType === 'string' ? body.eventType : '';
        const eventData = body.eventData || {};

        if (!eventType) {
          sendJson(res, 400, { message: 'Event type is required' });
          return;
        }

        try {
          const result = await trackEvent(user.arcAccountId, eventType, eventData);
          sendJson(res, 201, result);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      // Smart Contract Wallet Endpoints
      if (method === 'POST' && url.pathname === '/api/smart-contracts/wallet/deploy') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const walletType = typeof body.walletType === 'string' ? body.walletType : 'treasury';
        const chainKey = typeof body.chain === 'string' ? body.chain : 'ETH-SEPOLIA';
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '';

        if (!privateKey) {
          sendJson(res, 500, { message: 'Deployer private key not configured' });
          return;
        }

        if (!SUPPORTED_CHAINS[chainKey]) {
          sendJson(res, 400, { message: `Unsupported chain: ${chainKey}` });
          return;
        }

        try {
          let deploymentResult;
          if (walletType === 'safe') {
            const owners = Array.isArray(body.owners) ? body.owners : [user.email];
            const threshold = Number(body.threshold) || 1;
            deploymentResult = await createSafeWallet(chainKey, owners, threshold);
          } else {
            // Treasury wallet
            const ownerAddress = typeof body.ownerAddress === 'string' ? body.ownerAddress : '';
            const policyEngineAddress = typeof body.policyEngineAddress === 'string' ? body.policyEngineAddress : '';
            deploymentResult = await deployTreasuryWallet(chainKey, ownerAddress || user.email, privateKey);
          }

          const walletData = {
            type: walletType,
            address: deploymentResult.contractAddress || deploymentResult.safeAddress,
            chain: chainKey,
            chainId: deploymentResult.chainId,
            deploymentTxHash: deploymentResult.deploymentTxHash,
            ...(walletType === 'safe' ? { owners: deploymentResult.owners, threshold: deploymentResult.threshold } : {}),
          };

          const wallet = await store.addSmartContractWallet(user.id, walletData);
          sendJson(res, 201, { wallet });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/smart-contracts/wallets') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        try {
          const wallets = await store.getSmartContractWallets(user.id);
          sendJson(res, 200, { wallets });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/smart-contracts/policy-engine/deploy') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const chainKey = typeof body.chain === 'string' ? body.chain : 'ETH-SEPOLIA';
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '';

        if (!privateKey) {
          sendJson(res, 500, { message: 'Deployer private key not configured' });
          return;
        }

        try {
          const deploymentResult = await deployPolicyEngine(chainKey, privateKey);
          sendJson(res, 201, { policyEngine: deploymentResult });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/smart-contracts/policy/create') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const policyName = typeof body.name === 'string' ? body.name : '';
        const config = body.config || {};
        const policyEngineAddress = typeof body.policyEngineAddress === 'string' ? body.policyEngineAddress : '';
        const chainKey = typeof body.chain === 'string' ? body.chain : 'ETH-SEPOLIA';
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '';

        if (!policyName) {
          sendJson(res, 400, { message: 'Policy name is required' });
          return;
        }

        if (!policyEngineAddress) {
          sendJson(res, 400, { message: 'Policy engine address is required' });
          return;
        }

        try {
          const policyResult = await createPolicy(policyEngineAddress, chainKey, policyName, config, privateKey);
          
          const policyData = {
            name: policyName,
            address: policyResult.policyAddress,
            chain: chainKey,
            config,
            transactionHash: policyResult.transactionHash,
          };

          const policy = await store.addPolicy(user.id, policyData);
          sendJson(res, 201, { policy });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/smart-contracts/policies') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        try {
          const policies = await store.getPolicies(user.id);
          sendJson(res, 200, { policies });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/smart-contracts/treasury/allocate') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const contractAddress = typeof body.contractAddress === 'string' ? body.contractAddress : '';
        const recipient = typeof body.recipient === 'string' ? body.recipient : '';
        const amount = Number(body.amount);
        const reason = typeof body.reason === 'string' ? body.reason : '';
        const chainKey = typeof body.chain === 'string' ? body.chain : 'ETH-SEPOLIA';
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '';

        if (!contractAddress || !recipient || !amount || amount <= 0) {
          sendJson(res, 400, { message: 'Contract address, recipient, and valid amount are required' });
          return;
        }

        try {
          const result = await executeAllocation(contractAddress, chainKey, recipient, amount, reason, privateKey);
          
          // Record transaction
          await store.addTransaction({
            userId: user.id,
            type: 'allocation',
            amount,
            balanceAfter: await store.getChainBalance(user.id, chainKey),
            recipient,
            note: reason,
            chainKey,
          });

          sendJson(res, 201, { allocation: result });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/smart-contracts/treasury/distribute') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const contractAddress = typeof body.contractAddress === 'string' ? body.contractAddress : '';
        const recipients = Array.isArray(body.recipients) ? body.recipients : [];
        const amounts = Array.isArray(body.amounts) ? body.amounts.map(a => Number(a)) : [];
        const chainKey = typeof body.chain === 'string' ? body.chain : 'ETH-SEPOLIA';
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '';

        if (!contractAddress || recipients.length === 0 || amounts.length === 0 || recipients.length !== amounts.length) {
          sendJson(res, 400, { message: 'Contract address, recipients, and amounts arrays are required and must match in length' });
          return;
        }

        try {
          const result = await executeDistribution(contractAddress, chainKey, recipients, amounts, privateKey);
          
          // Record transaction
          await store.addTransaction({
            userId: user.id,
            type: 'distribution',
            amount: amounts.reduce((sum, a) => sum + a, 0),
            balanceAfter: await store.getChainBalance(user.id, chainKey),
            recipient: recipients.join(', '),
            note: `Distribution to ${recipients.length} recipients`,
            chainKey,
          });

          sendJson(res, 201, { distribution: result });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/smart-contracts/treasury/automation') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const body = await parseJsonBody(req);
        const automation = {
          name: typeof body.name === 'string' ? body.name : '',
          type: typeof body.type === 'string' ? body.type : 'allocation',
          contractAddress: typeof body.contractAddress === 'string' ? body.contractAddress : '',
          chain: typeof body.chain === 'string' ? body.chain : 'ETH-SEPOLIA',
          schedule: body.schedule || {},
          conditions: body.conditions || {},
          recipients: body.recipients || [],
          amounts: body.amounts || [],
          active: body.active !== false,
        };

        if (!automation.name || !automation.contractAddress) {
          sendJson(res, 400, { message: 'Name and contract address are required' });
          return;
        }

        try {
          const result = await store.addTreasuryAutomation(user.id, automation);
          sendJson(res, 201, { automation: result });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/smart-contracts/treasury/automations') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        try {
          const automations = await store.getTreasuryAutomations(user.id);
          sendJson(res, 200, { automations });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname.startsWith('/api/smart-contracts/treasury/automation/')) {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const automationId = url.pathname.split('/').pop();
        const body = await parseJsonBody(req);
        const action = typeof body.action === 'string' ? body.action : '';

        if (action === 'trigger') {
          // Trigger automation execution
          try {
            const automations = await store.getTreasuryAutomations(user.id);
            const automation = automations.find(a => a.id === automationId);
            
            if (!automation) {
              sendJson(res, 404, { message: 'Automation not found' });
              return;
            }

            if (!automation.active) {
              sendJson(res, 400, { message: 'Automation is not active' });
              return;
            }

            // Execute automation based on type
            if (automation.type === 'allocation') {
              const result = await executeAllocation(
                automation.contractAddress,
                automation.chain,
                automation.recipients[0],
                automation.amounts[0],
                automation.name,
                process.env.DEPLOYER_PRIVATE_KEY || ''
              );
              sendJson(res, 200, { result, message: 'Automation triggered successfully' });
            } else if (automation.type === 'distribution') {
              const result = await executeDistribution(
                automation.contractAddress,
                automation.chain,
                automation.recipients,
                automation.amounts,
                process.env.DEPLOYER_PRIVATE_KEY || ''
              );
              sendJson(res, 200, { result, message: 'Automation triggered successfully' });
            } else {
              sendJson(res, 400, { message: 'Unknown automation type' });
            }
          } catch (error) {
            sendJson(res, 500, { message: error.message });
          }
        } else {
          // Update automation
          try {
            const updates = {
              ...(body.name !== undefined ? { name: body.name } : {}),
              ...(body.active !== undefined ? { active: body.active } : {}),
              ...(body.schedule !== undefined ? { schedule: body.schedule } : {}),
              ...(body.conditions !== undefined ? { conditions: body.conditions } : {}),
            };

            const updated = await store.updateTreasuryAutomation(user.id, automationId, updates);
            if (!updated) {
              sendJson(res, 404, { message: 'Automation not found' });
              return;
            }

            sendJson(res, 200, { automation: updated });
          } catch (error) {
            sendJson(res, 500, { message: error.message });
          }
        }
        return;
      }

      if (method === 'GET' && url.pathname.startsWith('/api/smart-contracts/treasury/balance/')) {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        const contractAddress = url.pathname.split('/').pop();
        const chainKey = url.searchParams.get('chain') || 'ETH-SEPOLIA';

        try {
          const balance = await getTreasuryBalance(contractAddress, chainKey);
          sendJson(res, 200, { balance });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      // KYC/KYB Endpoints
      if (method === 'POST' && url.pathname === '/api/kyc/submit') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!kycKybService) {
          sendJson(res, 503, { message: 'KYC service not available' });
          return;
        }

        const body = await parseJsonBody(req);
        try {
          const record = await kycKybService.submitKyc(user.id, {
            documentType: body.documentType,
            documentNumber: body.documentNumber,
            firstName: body.firstName,
            lastName: body.lastName,
            dateOfBirth: body.dateOfBirth,
            address: body.address,
            country: body.country,
            documentImage: body.documentImage,
            selfieImage: body.selfieImage,
            provider: body.provider,
            autoVerify: body.autoVerify === true, // For testing
          });

          sendJson(res, 201, { record });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/kyb/submit') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!kycKybService) {
          sendJson(res, 503, { message: 'KYB service not available' });
          return;
        }

        const body = await parseJsonBody(req);
        try {
          const record = await kycKybService.submitKyb(user.id, {
            documentType: body.documentType,
            documentNumber: body.documentNumber,
            businessName: body.businessName,
            businessType: body.businessType,
            registrationNumber: body.registrationNumber,
            taxId: body.taxId,
            address: body.address,
            country: body.country,
            incorporationDate: body.incorporationDate,
            beneficialOwners: body.beneficialOwners,
            authorizedSignatories: body.authorizedSignatories,
            documentImage: body.documentImage,
            provider: body.provider,
            autoVerify: body.autoVerify === true, // For testing
          });

          sendJson(res, 201, { record });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/kyc-kyb/status') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!kycKybService) {
          sendJson(res, 503, { message: 'KYC/KYB service not available' });
          return;
        }

        try {
          const status = await kycKybService.getVerificationStatus(user.id);
          sendJson(res, 200, status);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/kyc-kyb/requirements') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!kycKybService) {
          sendJson(res, 503, { message: 'KYC/KYB service not available' });
          return;
        }

        const transactionAmount = Number(url.searchParams.get('amount')) || 0;
        try {
          const requirements = await kycKybService.checkVerificationRequirement(
            user.id,
            transactionAmount
          );
          sendJson(res, 200, requirements);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      // Sanctions Screening Endpoints
      if (method === 'POST' && url.pathname === '/api/sanctions/screen') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!sanctionsService) {
          sendJson(res, 503, { message: 'Sanctions screening service not available' });
          return;
        }

        const body = await parseJsonBody(req);
        const screeningType = body.type || 'address'; // address, name, email
        const value = body.value || '';

        if (!value) {
          sendJson(res, 400, { message: 'Value to screen is required' });
          return;
        }

        try {
          let result;
          if (screeningType === 'address') {
            result = await sanctionsService.screenAddress(value, user.id);
          } else {
            result = await sanctionsService.screenName(value, user.id, screeningType);
          }

          sendJson(res, 200, result);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'GET' && url.pathname === '/api/sanctions/history') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!sanctionsService) {
          sendJson(res, 503, { message: 'Sanctions screening service not available' });
          return;
        }

        const limit = Number(url.searchParams.get('limit')) || 50;
        try {
          const history = await sanctionsService.getScreeningHistory(user.id, limit);
          sendJson(res, 200, { screenings: history });
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
        return;
      }

      if (method === 'POST' && url.pathname === '/api/sanctions/rescreen') {
        const user = await authenticate(req, res, store);
        if (!user) {
          return;
        }

        if (!sanctionsService) {
          sendJson(res, 503, { message: 'Sanctions screening service not available' });
          return;
        }

        try {
          const result = await sanctionsService.rescreenUser(user.id);
          sendJson(res, 200, result);
        } catch (error) {
          sendJson(res, 500, { message: error.message });
        }
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
