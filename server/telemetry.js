import { randomUUID } from 'node:crypto';

/**
 * Telemetry and Observability Service
 * Captures metrics, logs, and traces for debugging and monitoring
 */

export class TelemetryService {
  constructor(store) {
    this.store = store;
    this.metrics = new Map();
    this.activeTraces = new Map();
  }

  /**
   * Log an event
   */
  async logEvent({ eventType, entityType, entityId, userId, data, timestamp }) {
    const eventId = randomUUID();
    const eventTimestamp = timestamp || new Date().toISOString();

    const event = {
      id: eventId,
      type: eventType,
      entityType,
      entityId,
      userId,
      data: JSON.stringify(data),
      timestamp: eventTimestamp,
      createdAt: eventTimestamp,
    };

    try {
      // Store in audit log
      await this.store.createAuditLog({
        userId,
        action: eventType,
        entityType,
        entityId,
        changes: data,
        createdAt: eventTimestamp,
      });

      // Update metrics
      this.incrementMetric(`events.${eventType}`);
      
      console.log(`[TELEMETRY] ${eventType}:`, {
        entityType,
        entityId,
        userId,
        data,
      });

      return event;
    } catch (error) {
      console.error('[TELEMETRY] Failed to log event:', error);
      throw error;
    }
  }

  /**
   * Log an error
   */
  async logError({ errorType, entityType, entityId, userId, error, data, timestamp }) {
    const errorId = randomUUID();
    const errorTimestamp = timestamp || new Date().toISOString();

    const errorLog = {
      id: errorId,
      type: errorType,
      entityType,
      entityId,
      userId,
      error: typeof error === 'string' ? error : error.message || 'Unknown error',
      stack: error.stack || null,
      data: JSON.stringify(data),
      timestamp: errorTimestamp,
      createdAt: errorTimestamp,
    };

    try {
      // Store in audit log
      await this.store.createAuditLog({
        userId,
        action: `error_${errorType}`,
        entityType,
        entityId,
        changes: {
          error: errorLog.error,
          ...data,
        },
        createdAt: errorTimestamp,
      });

      // Update metrics
      this.incrementMetric(`errors.${errorType}`);
      this.incrementMetric('errors.total');

      console.error(`[TELEMETRY] ERROR ${errorType}:`, {
        entityType,
        entityId,
        userId,
        error: errorLog.error,
        data,
      });

      return errorLog;
    } catch (err) {
      console.error('[TELEMETRY] Failed to log error:', err);
      throw err;
    }
  }

  /**
   * Start a trace for tracking operation duration
   */
  startTrace(traceId, operation, metadata = {}) {
    const trace = {
      id: traceId || randomUUID(),
      operation,
      metadata,
      startTime: Date.now(),
      spans: [],
    };

    this.activeTraces.set(trace.id, trace);
    
    console.log(`[TRACE] Started: ${operation} (${trace.id})`);
    
    return trace.id;
  }

  /**
   * Add a span to a trace
   */
  addSpan(traceId, spanName, data = {}) {
    const trace = this.activeTraces.get(traceId);
    if (!trace) {
      console.warn(`[TRACE] No active trace found: ${traceId}`);
      return;
    }

    const span = {
      name: spanName,
      timestamp: Date.now(),
      duration: Date.now() - trace.startTime,
      data,
    };

    trace.spans.push(span);
    
    console.log(`[TRACE] Span: ${spanName} at +${span.duration}ms`);
  }

  /**
   * End a trace and log results
   */
  async endTrace(traceId, success = true, result = {}) {
    const trace = this.activeTraces.get(traceId);
    if (!trace) {
      console.warn(`[TRACE] No active trace found: ${traceId}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - trace.startTime;

    trace.endTime = endTime;
    trace.duration = duration;
    trace.success = success;
    trace.result = result;

    this.activeTraces.delete(traceId);

    // Update metrics
    this.recordMetric(`traces.${trace.operation}.duration`, duration);
    this.incrementMetric(`traces.${trace.operation}.${success ? 'success' : 'failure'}`);

    console.log(`[TRACE] Completed: ${trace.operation} (${traceId}) in ${duration}ms - ${success ? 'SUCCESS' : 'FAILURE'}`);

    // Log trace event
    await this.logEvent({
      eventType: 'trace_completed',
      entityType: 'trace',
      entityId: traceId,
      userId: trace.metadata.userId,
      data: {
        operation: trace.operation,
        duration,
        success,
        spanCount: trace.spans.length,
      },
    });

    return {
      traceId,
      operation: trace.operation,
      duration,
      success,
      spans: trace.spans,
    };
  }

  /**
   * Record a metric value
   */
  recordMetric(metricName, value) {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        values: [],
      });
    }

    const metric = this.metrics.get(metricName);
    metric.count++;
    metric.sum += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.values.push(value);

    // Keep only last 100 values
    if (metric.values.length > 100) {
      metric.values.shift();
    }
  }

  /**
   * Increment a counter metric
   */
  incrementMetric(metricName, increment = 1) {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, { count: 0 });
    }

    const metric = this.metrics.get(metricName);
    metric.count += increment;
  }

  /**
   * Get metric statistics
   */
  getMetric(metricName) {
    const metric = this.metrics.get(metricName);
    if (!metric) {
      return null;
    }

    if (metric.values) {
      const avg = metric.sum / metric.count;
      const sorted = [...metric.values].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];

      return {
        name: metricName,
        count: metric.count,
        sum: metric.sum,
        min: metric.min,
        max: metric.max,
        avg,
        p50,
        p95,
        p99,
      };
    }

    return {
      name: metricName,
      count: metric.count,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const metrics = {};
    for (const [name, _] of this.metrics) {
      metrics[name] = this.getMetric(name);
    }
    return metrics;
  }

  /**
   * Log performance metrics
   */
  async logPerformanceMetrics() {
    const metrics = this.getAllMetrics();
    
    console.log('[TELEMETRY] Performance Metrics:', JSON.stringify(metrics, null, 2));

    return metrics;
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics.clear();
    console.log('[TELEMETRY] Metrics cleared');
  }

  /**
   * Health check
   */
  getHealth() {
    return {
      activeTraces: this.activeTraces.size,
      metricsCount: this.metrics.size,
      status: 'healthy',
    };
  }
}

