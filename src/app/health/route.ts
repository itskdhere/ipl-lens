import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  const memoryUsage = process.memoryUsage();

  const systemMetrics = {
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb:
        Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        checks: {
          database: {
            status: "up",
            componentType: "datastore",
            responseTimeMs,
          },
        },
        system: systemMetrics,
      },
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        data: {
          status: "unhealthy",
          checks: {
            database: {
              status: "down",
              componentType: "datastore",
              error: message,
            },
          },
          system: systemMetrics,
        },
        error: `Database connection failed: ${message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
