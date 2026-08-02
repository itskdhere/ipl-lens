import { NextResponse } from "next/server";

/**
 * Custom JSON replacer function to convert BigInt values to numbers/strings
 * so JSON.stringify doesn't throw a TypeError.
 */
function serializeBigInt(key: string, value: unknown) {
  if (typeof value === "bigint") {
    return Number(value);
  }
  return value;
}

/**
 * Standardized Success Response Helper
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
) {
  const payload = {
    success: true,
    data,
    meta: meta || null,
    error: null,
    timestamp: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(payload, serializeBigInt);
  return new NextResponse(jsonString, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Standardized Error Response Helper
 */
export function errorResponse(message: string, status = 500) {
  const payload = {
    success: false,
    data: null,
    error: message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, { status });
}
