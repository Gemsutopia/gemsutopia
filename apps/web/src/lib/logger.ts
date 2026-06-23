import pino from 'pino';

// Logger configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create the base logger
const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Add standard fields
  base: {
    env: process.env.NODE_ENV,
    service: 'gemsutopia',
  },

  // Format timestamps in ISO format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Redact sensitive fields from logs
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'Authorization',
      'cookie',
      'Cookie',
      'secret',
      'apiKey',
      'api_key',
      'stripe_key',
      'paypal_secret',
      'creditCard',
      'cardNumber',
      'cvv',
      'ssn',
      '*.password',
      '*.token',
      '*.secret',
      'headers.authorization',
      'headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  // Format options for development
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
    }),
  },

  // Transport for pretty printing in development
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      },
    },
  }),
});

// Child logger factory for modules
export function createLogger(module: string) {
  return logger.child({ module });
}

// Typed logger methods for common use cases
export const log = {
  // General logging
  info: (msg: string, data?: Record<string, unknown>) => logger.info(data, msg),
  warn: (msg: string, data?: Record<string, unknown>) => logger.warn(data, msg),
  error: (msg: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    if (error instanceof Error) {
      logger.error({ ...data, err: error }, msg);
    } else {
      logger.error({ ...data, error }, msg);
    }
  },
  debug: (msg: string, data?: Record<string, unknown>) => logger.debug(data, msg),

  // API request logging
  request: (method: string, path: string, data?: Record<string, unknown>) => {
    logger.info({ method, path, ...data }, `${method} ${path}`);
  },

  // API response logging
  response: (method: string, path: string, statusCode: number, duration?: number) => {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    logger[level]({ method, path, statusCode, duration }, `${method} ${path} ${statusCode}`);
  },

  // Database query logging
  query: (operation: string, table: string, duration?: number, data?: Record<string, unknown>) => {
    logger.debug({ operation, table, duration, ...data }, `DB ${operation} ${table}`);
  },

  // Payment logging
  payment: (provider: string, action: string, data?: Record<string, unknown>) => {
    logger.info({ provider, action, ...data }, `Payment ${provider} ${action}`);
  },

  // Authentication logging
  auth: (action: string, success: boolean, data?: Record<string, unknown>) => {
    const level = success ? 'info' : 'warn';
    logger[level]({ action, success, ...data }, `Auth ${action} ${success ? 'success' : 'failed'}`);
  },

  // Order logging
  order: (action: string, orderId: string, data?: Record<string, unknown>) => {
    logger.info({ action, orderId, ...data }, `Order ${action} ${orderId}`);
  },

  // Audit logging (for admin actions)
  audit: (action: string, resource: string, resourceId?: string, data?: Record<string, unknown>) => {
    logger.info({ action, resource, resourceId, type: 'audit', ...data }, `Audit: ${action} ${resource}`);
  },
};

// Export the base logger for advanced usage
export default logger;
