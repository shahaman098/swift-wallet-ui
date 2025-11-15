import { randomUUID } from 'node:crypto';

/**
 * Payment State Machine
 * Manages payment lifecycle with proper state transitions and error handling
 */

export const PAYMENT_STATES = {
  INITIATED: 'initiated',
  VALIDATING: 'validating',
  PROCESSING: 'processing',
  PENDING: 'pending',
  SETTLING: 'settling',
  SETTLED: 'settled',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REQUIRES_ACTION: 'requires_action',
};

export const PAYMENT_TRANSITIONS = {
  [PAYMENT_STATES.INITIATED]: [PAYMENT_STATES.VALIDATING, PAYMENT_STATES.FAILED],
  [PAYMENT_STATES.VALIDATING]: [PAYMENT_STATES.PROCESSING, PAYMENT_STATES.FAILED, PAYMENT_STATES.REQUIRES_ACTION],
  [PAYMENT_STATES.PROCESSING]: [PAYMENT_STATES.PENDING, PAYMENT_STATES.COMPLETED, PAYMENT_STATES.FAILED],
  [PAYMENT_STATES.PENDING]: [PAYMENT_STATES.SETTLING, PAYMENT_STATES.FAILED, PAYMENT_STATES.CANCELLED],
  [PAYMENT_STATES.SETTLING]: [PAYMENT_STATES.SETTLED, PAYMENT_STATES.FAILED],
  [PAYMENT_STATES.SETTLED]: [PAYMENT_STATES.COMPLETED],
  [PAYMENT_STATES.REQUIRES_ACTION]: [PAYMENT_STATES.VALIDATING, PAYMENT_STATES.CANCELLED],
  [PAYMENT_STATES.COMPLETED]: [], // Terminal state
  [PAYMENT_STATES.FAILED]: [], // Terminal state
  [PAYMENT_STATES.CANCELLED]: [], // Terminal state
};

export class PaymentStateMachine {
  constructor(store, telemetryService) {
    this.store = store;
    this.telemetry = telemetryService;
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    };
  }

  /**
   * Create a new payment with initial state
   */
  async createPayment(paymentData) {
    const paymentId = randomUUID();
    const timestamp = new Date().toISOString();

    const payment = {
      id: paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      recipient: paymentData.recipient,
      sourceChain: paymentData.sourceChain,
      destinationChain: paymentData.destinationChain,
      note: paymentData.note,
      state: PAYMENT_STATES.INITIATED,
      stateHistory: [{
        state: PAYMENT_STATES.INITIATED,
        timestamp,
        metadata: {},
      }],
      retryCount: 0,
      metadata: paymentData.metadata || {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Log telemetry
    await this.telemetry.logEvent({
      eventType: 'payment_created',
      entityType: 'payment',
      entityId: paymentId,
      userId: paymentData.userId,
      data: {
        amount: paymentData.amount,
        sourceChain: paymentData.sourceChain,
        destinationChain: paymentData.destinationChain,
      },
      timestamp,
    });

    return payment;
  }

  /**
   * Transition payment to a new state with validation
   */
  async transitionState(payment, newState, metadata = {}) {
    const currentState = payment.state;

    // Validate transition
    if (!this.canTransition(currentState, newState)) {
      const error = new Error(
        `Invalid state transition from ${currentState} to ${newState}`
      );
      
      await this.telemetry.logError({
        errorType: 'invalid_state_transition',
        entityType: 'payment',
        entityId: payment.id,
        userId: payment.userId,
        error: error.message,
        data: { currentState, attemptedState: newState },
      });

      throw error;
    }

    const timestamp = new Date().toISOString();

    // Update payment state
    payment.state = newState;
    payment.stateHistory.push({
      state: newState,
      timestamp,
      metadata,
    });
    payment.updatedAt = timestamp;

    // Log telemetry
    await this.telemetry.logEvent({
      eventType: 'payment_state_changed',
      entityType: 'payment',
      entityId: payment.id,
      userId: payment.userId,
      data: {
        previousState: currentState,
        newState,
        metadata,
      },
      timestamp,
    });

    return payment;
  }

  /**
   * Check if transition is valid
   */
  canTransition(currentState, newState) {
    const allowedStates = PAYMENT_TRANSITIONS[currentState] || [];
    return allowedStates.includes(newState);
  }

  /**
   * Process payment with retry logic
   */
  async processWithRetry(payment, processFn, options = {}) {
    const maxRetries = options.maxRetries || this.retryConfig.maxRetries;
    const retryDelay = options.retryDelay || this.retryConfig.retryDelay;
    const backoffMultiplier = options.backoffMultiplier || this.retryConfig.backoffMultiplier;

    let lastError = null;
    let currentDelay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Log attempt
        await this.telemetry.logEvent({
          eventType: 'payment_processing_attempt',
          entityType: 'payment',
          entityId: payment.id,
          userId: payment.userId,
          data: {
            attempt: attempt + 1,
            maxRetries: maxRetries + 1,
          },
        });

        const result = await processFn(payment, attempt);
        
        // Success - log and return
        await this.telemetry.logEvent({
          eventType: 'payment_processing_success',
          entityType: 'payment',
          entityId: payment.id,
          userId: payment.userId,
          data: {
            attempt: attempt + 1,
            result,
          },
        });

        return result;
      } catch (error) {
        lastError = error;
        payment.retryCount = attempt + 1;

        await this.telemetry.logError({
          errorType: 'payment_processing_error',
          entityType: 'payment',
          entityId: payment.id,
          userId: payment.userId,
          error: error.message,
          data: {
            attempt: attempt + 1,
            willRetry: attempt < maxRetries,
          },
        });

        // If this is the last attempt, throw
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }

    // All retries failed
    await this.transitionState(payment, PAYMENT_STATES.FAILED, {
      error: lastError?.message || 'Unknown error',
      retries: payment.retryCount,
    });

    throw lastError;
  }

  /**
   * Get payment state summary
   */
  getStateSummary(payment) {
    const currentState = payment.state;
    const isTerminal = [
      PAYMENT_STATES.COMPLETED,
      PAYMENT_STATES.FAILED,
      PAYMENT_STATES.CANCELLED,
    ].includes(currentState);

    const duration = payment.stateHistory.length > 1
      ? new Date(payment.updatedAt) - new Date(payment.createdAt)
      : 0;

    return {
      paymentId: payment.id,
      currentState,
      isTerminal,
      retryCount: payment.retryCount,
      stateCount: payment.stateHistory.length,
      durationMs: duration,
      lastTransition: payment.stateHistory[payment.stateHistory.length - 1],
    };
  }

  /**
   * Check if payment requires action
   */
  requiresAction(payment) {
    return payment.state === PAYMENT_STATES.REQUIRES_ACTION;
  }

  /**
   * Check if payment is complete
   */
  isComplete(payment) {
    return payment.state === PAYMENT_STATES.COMPLETED;
  }

  /**
   * Check if payment failed
   */
  isFailed(payment) {
    return payment.state === PAYMENT_STATES.FAILED;
  }

  /**
   * Check if payment is in progress
   */
  isInProgress(payment) {
    return ![
      PAYMENT_STATES.COMPLETED,
      PAYMENT_STATES.FAILED,
      PAYMENT_STATES.CANCELLED,
    ].includes(payment.state);
  }
}

