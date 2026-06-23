import { NextResponse } from 'next/server';

/**
 * Standardized API Response Format
 *
 * Success: { success: true, data: T, message?: string }
 * Error: { success: false, error: { message: string, code: string, details?: unknown } }
 */

// Error codes for consistent error identification
export const ErrorCode = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// Response types
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: ErrorCodeType;
    details?: unknown;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Success response helper
export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const body: SuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return NextResponse.json(body, { status });
}

// Error response helper
export function apiError(
  message: string,
  code: ErrorCodeType = ErrorCode.INTERNAL_ERROR,
  status = 500,
  details?: unknown
) {
  const body: ErrorResponse = {
    success: false,
    error: { message, code },
  };
  if (details !== undefined) body.error.details = details;
  return NextResponse.json(body, { status });
}

// Common error responses
export const ApiError = {
  badRequest: (message = 'Bad request', details?: unknown) =>
    apiError(message, ErrorCode.BAD_REQUEST, 400, details),

  validation: (message: string, details?: unknown) =>
    apiError(message, ErrorCode.VALIDATION_ERROR, 400, details),

  unauthorized: (message = 'Unauthorized') =>
    apiError(message, ErrorCode.UNAUTHORIZED, 401),

  forbidden: (message = 'Forbidden') =>
    apiError(message, ErrorCode.FORBIDDEN, 403),

  notFound: (resource = 'Resource') =>
    apiError(`${resource} not found`, ErrorCode.NOT_FOUND, 404),

  methodNotAllowed: (allowed: string[]) =>
    apiError(
      `Method not allowed. Allowed: ${allowed.join(', ')}`,
      ErrorCode.METHOD_NOT_ALLOWED,
      405
    ),

  conflict: (message: string, details?: unknown) =>
    apiError(message, ErrorCode.CONFLICT, 409, details),

  rateLimited: (message = 'Too many requests. Please try again later.', details?: unknown) =>
    apiError(message, ErrorCode.RATE_LIMITED, 429, details),

  internal: (message = 'Internal server error') =>
    apiError(message, ErrorCode.INTERNAL_ERROR, 500),

  database: (message = 'Database error') =>
    apiError(message, ErrorCode.DATABASE_ERROR, 500),

  externalService: (service: string, message?: string) =>
    apiError(
      message || `${service} service error`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502
    ),
};

// Type exports for client-side usage
export type { ApiResponse, SuccessResponse, ErrorResponse };
