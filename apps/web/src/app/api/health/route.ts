import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    api: HealthCheck;
    memory: HealthCheck;
  };
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  latency?: number;
  message?: string;
}

// Track server start time for uptime calculation
const startTime = Date.now();

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: HealthStatus['checks'] = {
    api: { status: 'fail' },
    memory: { status: 'fail' },
  };

  let overallStatus: HealthStatus['status'] = 'healthy';

  // Check Quickdash API connectivity
  try {
    const apiStart = Date.now();
    await store.site.getSettings();
    const apiLatency = Date.now() - apiStart;

    checks.api = {
      status: apiLatency > 3000 ? 'warn' : 'pass',
      latency: apiLatency,
    };

    if (apiLatency > 3000) {
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.api = {
      status: 'fail',
      message: error instanceof Error ? error.message : 'API connection failed',
    };
    overallStatus = 'unhealthy';
  }

  // Check memory usage
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    checks.memory = {
      status: heapPercentage > 90 ? 'warn' : 'pass',
      message: `${heapUsedMB}MB / ${heapTotalMB}MB (${Math.round(heapPercentage)}%)`,
    };

    if (heapPercentage > 90 && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  } catch {
    checks.memory = {
      status: 'warn',
      message: 'Unable to check memory',
    };
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp,
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  // Return appropriate status code
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

// HEAD request for simple liveness probe
export async function HEAD() {
  try {
    await store.site.getSettings();
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
