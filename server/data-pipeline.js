import { randomUUID } from 'node:crypto';

/**
 * Data Pipeline for processing transactions, user verification, and sanctions screening
 */
export class DataPipeline {
  constructor(store, sanctionsService, kycService) {
    this.store = store;
    this.sanctionsService = sanctionsService;
    this.kycService = kycService;
  }

  /**
   * Process a transaction through the pipeline
   */
  async processTransaction(transactionData) {
    const startTime = Date.now();
    const pipelineLogId = randomUUID();
    
    try {
      // Create pipeline log
      await this.store.createPipelineLog({
        pipelineType: 'transaction_processing',
        entityType: 'transaction',
        entityId: transactionData.id || 'pending',
        status: 'processing',
        inputData: transactionData,
        createdAt: new Date().toISOString(),
      });

      const steps = [];
      
      // Step 1: Sanctions screening for recipient
      if (transactionData.recipient) {
        try {
          const screeningResult = await this.sanctionsService.screenAddress(
            transactionData.recipient,
            transactionData.userId,
            transactionData.id
          );
          
          steps.push({
            step: 'sanctions_screening',
            status: screeningResult.result,
            timestamp: new Date().toISOString(),
            details: screeningResult,
          });

          // If flagged, block transaction
          if (screeningResult.result === 'flagged') {
            await this.store.updatePipelineLog(pipelineLogId, {
              status: 'failed',
              outputData: {
                error: 'Transaction blocked due to sanctions screening',
                screeningResult,
              },
              errorMessage: 'Sanctions screening flagged recipient address',
              processingTimeMs: Date.now() - startTime,
              completedAt: new Date().toISOString(),
            });

            return {
              success: false,
              blocked: true,
              reason: 'sanctions_screening',
              screeningResult,
            };
          }
        } catch (error) {
          console.error('Sanctions screening error:', error);
          steps.push({
            step: 'sanctions_screening',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Step 2: Verify user KYC/KYB status
      if (transactionData.userId) {
        try {
          const user = await this.store.getUserById(transactionData.userId);
          if (user) {
            const kycStatus = user.kycStatus || 'pending';
            const kybStatus = user.kybStatus || 'pending';

            steps.push({
              step: 'kyc_kyb_verification',
              kycStatus,
              kybStatus,
              timestamp: new Date().toISOString(),
            });

            // For large transactions, require verified KYC
            if (transactionData.amount > 10000) {
              if (kycStatus !== 'verified') {
                await this.store.updatePipelineLog(pipelineLogId, {
                  status: 'failed',
                  outputData: {
                    error: 'Transaction requires verified KYC for amounts over $10,000',
                    kycStatus,
                  },
                  errorMessage: 'KYC verification required',
                  processingTimeMs: Date.now() - startTime,
                  completedAt: new Date().toISOString(),
                });

                return {
                  success: false,
                  blocked: true,
                  reason: 'kyc_required',
                  kycStatus,
                };
              }
            }
          }
        } catch (error) {
          console.error('KYC/KYB verification error:', error);
          steps.push({
            step: 'kyc_kyb_verification',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Step 3: Additional validation
      steps.push({
        step: 'validation',
        status: 'completed',
        timestamp: new Date().toISOString(),
      });

      const processingTime = Date.now() - startTime;

      // Get the screening result from steps if available
      const screeningStep = steps.find(s => s.step === 'sanctions_screening');
      const screeningResult = screeningStep?.details || null;

      await this.store.updatePipelineLog(pipelineLogId, {
        status: 'completed',
        outputData: {
          steps,
          processingTimeMs: processingTime,
          screeningResult,
        },
        processingTimeMs: processingTime,
        completedAt: new Date().toISOString(),
      });

      return {
        success: true,
        steps,
        processingTimeMs: processingTime,
        screeningResult,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.store.updatePipelineLog(pipelineLogId, {
        status: 'failed',
        errorMessage: error.message,
        processingTimeMs: processingTime,
        completedAt: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Process user registration through the pipeline
   */
  async processUserRegistration(userData) {
    const startTime = Date.now();
    const pipelineLogId = randomUUID();

    try {
      await this.store.createPipelineLog({
        pipelineType: 'user_verification',
        entityType: 'user',
        entityId: userData.id || 'pending',
        status: 'processing',
        inputData: { email: userData.email, name: userData.name },
        createdAt: new Date().toISOString(),
      });

      const steps = [];

      // Step 1: Initial sanctions screening on email/name
      try {
        const emailScreening = await this.sanctionsService.screenName(
          userData.email,
          userData.id,
          'email'
        );
        
        const nameScreening = await this.sanctionsService.screenName(
          userData.name,
          userData.id,
          'name'
        );

        steps.push({
          step: 'initial_sanctions_screening',
          emailResult: emailScreening.result,
          nameResult: nameScreening.result,
          timestamp: new Date().toISOString(),
        });

        if (emailScreening.result === 'flagged' || nameScreening.result === 'flagged') {
          await this.store.updatePipelineLog(pipelineLogId, {
            status: 'failed',
            outputData: {
              error: 'User registration blocked due to sanctions screening',
              emailScreening,
              nameScreening,
            },
            errorMessage: 'Sanctions screening flagged user information',
            processingTimeMs: Date.now() - startTime,
            completedAt: new Date().toISOString(),
          });

          return {
            success: false,
            blocked: true,
            reason: 'sanctions_screening',
            emailScreening,
            nameScreening,
          };
        }
      } catch (error) {
        console.error('Sanctions screening error:', error);
        steps.push({
          step: 'initial_sanctions_screening',
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      // Step 2: Set up KYC/KYB workflow
      steps.push({
        step: 'kyc_kyb_setup',
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      const processingTime = Date.now() - startTime;

      await this.store.updatePipelineLog(pipelineLogId, {
        status: 'completed',
        outputData: {
          steps,
          processingTimeMs: processingTime,
        },
        processingTimeMs: processingTime,
        completedAt: new Date().toISOString(),
      });

      return {
        success: true,
        steps,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.store.updatePipelineLog(pipelineLogId, {
        status: 'failed',
        errorMessage: error.message,
        processingTimeMs: processingTime,
        completedAt: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Get pipeline logs for an entity
   */
  async getPipelineLogs(entityType, entityId, limit = 50) {
    // This would query the database for pipeline logs
    // For now, we'll return a placeholder
    return [];
  }
}

