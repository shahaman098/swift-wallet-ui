export function setCorsHeaders(res) {
  const origin = process.env.CLIENT_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

export function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function formatTransaction(transaction) {
  const formatted = {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    balanceAfter: transaction.balanceAfter,
    createdAt: transaction.createdAt,
  };

  if (transaction.recipient) {
    formatted.recipient = transaction.recipient;
  }

  if (transaction.note) {
    formatted.note = transaction.note;
  }

  // Chain information
  if (transaction.chainKey) {
    formatted.chainKey = transaction.chainKey;
  }

  if (transaction.sourceChain) {
    formatted.sourceChain = transaction.sourceChain;
  }

  if (transaction.destinationChain) {
    formatted.destinationChain = transaction.destinationChain;
  }

  // Settlement state for cross-chain transfers
  if (transaction.settlementState) {
    formatted.settlementState = transaction.settlementState;
  }

  if (transaction.cctpTransferId) {
    formatted.cctpTransferId = transaction.cctpTransferId;
  }

  if (transaction.burnTxHash) {
    formatted.burnTxHash = transaction.burnTxHash;
  }

  if (transaction.mintTxHash) {
    formatted.mintTxHash = transaction.mintTxHash;
  }

  if (transaction.attestation) {
    formatted.attestation = transaction.attestation;
  }

  if (transaction.updatedAt) {
    formatted.updatedAt = transaction.updatedAt;
  }

  return formatted;
}

export async function parseJsonBody(req) {
  const chunks = [];
  let totalLength = 0;

  for await (const chunk of req) {
    chunks.push(chunk);
    totalLength += chunk.length;
    if (totalLength > 1_000_000) {
      throw new Error('Request body too large');
    }
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks, totalLength).toString('utf8');

  try {
    return JSON.parse(raw);
  } catch (error) {
    const invalid = new Error('Invalid JSON payload');
    invalid.cause = error;
    throw invalid;
  }
}
