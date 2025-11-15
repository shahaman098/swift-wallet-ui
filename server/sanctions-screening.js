/**
 * Sanctions Screening Service
 * 
 * This service screens users, addresses, and transactions against sanctions lists
 * In production, this would integrate with services like:
 * - Dow Jones Risk & Compliance
 * - World-Check
 * - ComplyAdvantage
 * - Chainalysis
 */

// Mock sanctions list for demonstration
// In production, this would be loaded from a database or external API
const MOCK_SANCTIONS_LIST = [
  { name: 'John Doe', type: 'individual', country: 'US' },
  { name: 'Jane Smith', type: 'individual', country: 'UK' },
  { address: '0x1234567890123456789012345678901234567890', type: 'wallet' },
  { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', type: 'wallet' },
];

export class SanctionsScreeningService {
  constructor(store) {
    this.store = store;
  }

  /**
   * Screen a name against sanctions lists
   */
  async screenName(name, userId = null, screeningType = 'name') {
    const timestamp = new Date().toISOString();
    
    // Normalize name for comparison
    const normalizedName = name.toLowerCase().trim();
    
    // Check against sanctions list
    let matchFound = false;
    let matchDetails = null;
    let riskScore = 0;

    // Simple fuzzy matching (in production, use proper fuzzy matching algorithms)
    for (const entry of MOCK_SANCTIONS_LIST) {
      if (entry.type === 'individual' && entry.name) {
        const entryName = entry.name.toLowerCase();
        // Exact match
        if (normalizedName === entryName) {
          matchFound = true;
          matchDetails = {
            matchedEntry: entry,
            matchType: 'exact',
            confidence: 1.0,
          };
          riskScore = 1.0;
          break;
        }
        // Partial match (contains)
        if (normalizedName.includes(entryName) || entryName.includes(normalizedName)) {
          matchFound = true;
          matchDetails = {
            matchedEntry: entry,
            matchType: 'partial',
            confidence: 0.7,
          };
          riskScore = 0.7;
          break;
        }
      }
    }

    const result = matchFound ? 'flagged' : 'cleared';

    // Store screening result
    const screening = await this.store.createSanctionsScreening({
      userId,
      entityType: userId ? 'user' : 'unknown',
      entityIdentifier: userId || name,
      screeningType,
      screenedValue: name,
      provider: 'internal',
      result,
      matchDetails,
      riskScore,
      screenedAt: timestamp,
    });

    // Update user's sanctions check status if applicable
    if (userId) {
      await this.store.updateUser(userId, {
        sanctionsCheckStatus: result,
        sanctionsCheckAt: timestamp,
        sanctionsCheckResult: {
          lastScreening: screening.id,
          result,
          matchDetails,
          riskScore,
        },
      });
    }

    return {
      id: screening.id,
      result,
      matchDetails,
      riskScore,
      screenedAt: timestamp,
    };
  }

  /**
   * Screen a wallet address against sanctions lists
   */
  async screenAddress(address, userId = null, transactionId = null) {
    const timestamp = new Date().toISOString();
    
    // Normalize address (lowercase, remove 0x prefix for comparison)
    const normalizedAddress = address.toLowerCase().trim();
    
    // Check against sanctions list
    let matchFound = false;
    let matchDetails = null;
    let riskScore = 0;

    for (const entry of MOCK_SANCTIONS_LIST) {
      if (entry.type === 'wallet' && entry.address) {
        const entryAddress = entry.address.toLowerCase();
        if (normalizedAddress === entryAddress) {
          matchFound = true;
          matchDetails = {
            matchedEntry: entry,
            matchType: 'exact',
            confidence: 1.0,
          };
          riskScore = 1.0;
          break;
        }
      }
    }

    // In production, also check:
    // - Chainalysis API for address risk
    // - Elliptic API
    // - Other blockchain analytics services

    const result = matchFound ? 'flagged' : 'cleared';

    // Store screening result
    const screening = await this.store.createSanctionsScreening({
      userId,
      transactionId,
      entityType: transactionId ? 'transaction' : (userId ? 'user' : 'unknown'),
      entityIdentifier: transactionId || userId || address,
      screeningType: 'wallet_address',
      screenedValue: address,
      provider: 'internal',
      result,
      matchDetails,
      riskScore,
      screenedAt: timestamp,
    });

    // Update transaction if applicable
    if (transactionId) {
      const transaction = await this.store.getTransactionById(transactionId);
      if (transaction) {
        // Note: We'd need to add an update method for transactions
        // For now, the screening is stored separately
      }
    }

    return {
      id: screening.id,
      result,
      matchDetails,
      riskScore,
      screenedAt: timestamp,
    };
  }

  /**
   * Screen multiple entities in batch
   */
  async screenBatch(screenings) {
    const results = [];
    
    for (const screening of screenings) {
      try {
        if (screening.type === 'name') {
          const result = await this.screenName(
            screening.value,
            screening.userId,
            screening.screeningType || 'name'
          );
          results.push(result);
        } else if (screening.type === 'address') {
          const result = await this.screenAddress(
            screening.value,
            screening.userId,
            screening.transactionId
          );
          results.push(result);
        }
      } catch (error) {
        console.error('Screening error:', error);
        results.push({
          value: screening.value,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get screening history for a user
   */
  async getScreeningHistory(userId, limit = 50) {
    return await this.store.getSanctionsScreeningsForUser(userId, limit);
  }

  /**
   * Re-screen a user (useful for periodic re-screening)
   */
  async rescreenUser(userId) {
    const user = await this.store.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const screenings = [];

    // Screen name
    if (user.name) {
      const nameScreening = await this.screenName(user.name, userId, 'name');
      screenings.push(nameScreening);
    }

    // Screen email
    if (user.email) {
      const emailScreening = await this.screenName(user.email, userId, 'email');
      screenings.push(emailScreening);
    }

    // Determine overall result
    const hasFlagged = screenings.some(s => s.result === 'flagged');
    const overallResult = hasFlagged ? 'flagged' : 'cleared';

    await this.store.updateUser(userId, {
      sanctionsCheckStatus: overallResult,
      sanctionsCheckAt: new Date().toISOString(),
      sanctionsCheckResult: {
        screenings,
        overallResult,
      },
    });

    return {
      overallResult,
      screenings,
    };
  }
}

