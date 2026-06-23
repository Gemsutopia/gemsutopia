import * as Sentry from '@sentry/nextjs';
import { log } from './logger';

/**
 * Performance monitoring utilities
 * Integrates with Sentry tracing for distributed tracing
 */

// Threshold for slow operations (ms)
const SLOW_THRESHOLDS = {
  database: 500,
  api: 1000,
  external: 2000,
  general: 1000,
};

/**
 * Measure execution time of an async function
 */
export async function measure<T>(
  name: string,
  operation: 'database' | 'api' | 'external' | 'general',
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();

  // Start Sentry span if available
  const span = Sentry.startInactiveSpan({
    name,
    op: operation,
    attributes: metadata as Record<string, string | number | boolean | undefined>,
  });

  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);

    // Log slow operations
    const threshold = SLOW_THRESHOLDS[operation] || SLOW_THRESHOLDS.general;
    if (duration > threshold) {
      log.warn(`Slow ${operation}: ${name}`, { duration, threshold, ...metadata });
    }

    span?.setStatus({ code: 1 }); // OK
    span?.end();

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    log.error(`Failed ${operation}: ${name}`, error, { duration, ...metadata });

    span?.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' }); // Error
    span?.end();

    throw error;
  }
}

/**
 * Measure database query execution
 */
export async function measureQuery<T>(
  queryName: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return measure(queryName, 'database', fn, metadata);
}

/**
 * Measure API call execution
 */
export async function measureApiCall<T>(
  endpoint: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return measure(endpoint, 'api', fn, metadata);
}

/**
 * Measure external service call
 */
export async function measureExternal<T>(
  serviceName: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return measure(serviceName, 'external', fn, metadata);
}

/**
 * Simple timing decorator for functions
 */
export function timed<T extends (...args: unknown[]) => Promise<unknown>>(
  name: string,
  fn: T
): T {
  return (async (...args: unknown[]) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = Math.round(performance.now() - start);
      log.debug(`${name} completed`, { duration });
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      log.error(`${name} failed`, error, { duration });
      throw error;
    }
  }) as T;
}

/**
 * Track custom metrics
 */
export function trackMetric(
  name: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count' | 'percent' = 'count',
  tags?: Record<string, string>
) {
  // Log the metric
  log.debug(`Metric: ${name}`, { value, unit, ...tags });

  // Send to Sentry as a custom metric
  Sentry.setMeasurement(name, value, unit === 'ms' ? 'millisecond' : unit);
}

/**
 * Create a performance mark for measuring between points
 */
export function mark(name: string): () => number {
  const start = performance.now();
  return () => {
    const duration = Math.round(performance.now() - start);
    log.debug(`Mark: ${name}`, { duration });
    return duration;
  };
}

/**
 * Wrap an API route handler with performance monitoring
 */
export function withPerformance<T extends (...args: unknown[]) => Promise<Response>>(
  routeName: string,
  handler: T
): T {
  return (async (...args: unknown[]) => {
    const start = performance.now();

    try {
      const response = await handler(...args);
      const duration = Math.round(performance.now() - start);

      // Log response time
      log.response('API', routeName, response.status, duration);

      // Track slow responses
      if (duration > SLOW_THRESHOLDS.api) {
        trackMetric('slow_api_response', duration, 'ms', { route: routeName });
      }

      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      log.error(`API route error: ${routeName}`, error, { duration });
      throw error;
    }
  }) as T;
}
