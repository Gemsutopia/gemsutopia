import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Security utility functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function isRateLimited(ip: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = rateLimit.get(ip);
  if (!existing || existing.resetTime < windowStart) {
    rateLimit.set(ip, { count: 1, resetTime: now });
    return false;
  }

  if (existing.count >= maxRequests) {
    return true;
  }

  existing.count++;
  return false;
}

function detectXSSAttempt(url: string): boolean {
  const dangerousPatterns = [
    /<script[^>]*>.*?alert.*?<\/script>/gi,
    /javascript:alert/gi,
    /<iframe.*?src.*?javascript:/gi,
    /eval\s*\(.*?\)/gi,
  ];

  const urlParams = url.split('?')[1] || '';
  return dangerousPatterns.some(pattern => pattern.test(urlParams));
}

function detectSQLInjection(url: string): boolean {
  const dangerousSQLPatterns = [
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from.*where/gi,
    /insert\s+into.*values/gi,
    /select.*from.*information_schema/gi,
    /exec\s+xp_/gi,
  ];

  const urlParams = url.split('?')[1] || '';
  return dangerousSQLPatterns.some(pattern => pattern.test(urlParams));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const fullUrl = request.url;

  // 🛡️ SECURITY CHECKS

  // 1. Rate limiting
  if (isRateLimited(clientIP, 200, 60000)) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please slow down your requests',
      },
      { status: 429 }
    );
  }

  // 2. XSS detection
  if (pathname.startsWith('/api/') && detectXSSAttempt(fullUrl)) {
    return NextResponse.json(
      {
        error: 'Malicious request detected',
        message: 'XSS attempt blocked',
      },
      { status: 403 }
    );
  }

  // 3. SQL injection detection
  if (pathname.startsWith('/api/') && detectSQLInjection(fullUrl)) {
    return NextResponse.json(
      {
        error: 'Malicious request detected',
        message: 'SQL injection attempt blocked',
      },
      { status: 403 }
    );
  }

  // 4. Block attack tools and suspicious user agents
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousTools = [
    'sqlmap',
    'nikto',
    'masscan',
    'nessus',
    'burpsuite',
    'owasp',
    'metasploit',
  ];

  if (suspiciousTools.some(tool => userAgent.toLowerCase().includes(tool))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // 5. Block requests with no user agent (likely bots/scripts)
  if (!userAgent && pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        error: 'Access denied',
        message: 'User agent required',
      },
      { status: 403 }
    );
  }

  // Create response with security headers
  const response = NextResponse.next();

  // 🛡️ SECURITY HEADERS
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  const csp = [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:",
    "style-src 'self' 'unsafe-inline' https: data:",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https: data:",
    "connect-src 'self' https: http: ws: wss:",
    "frame-src 'self' https: http:",
    "media-src 'self' https: http:",
    "object-src 'self'",
  ].join('; ');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
