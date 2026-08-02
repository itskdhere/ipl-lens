export function safeInt(
  val: unknown,
  fallback: number | null = null
): number | null {
  if (val === undefined || val === null || val === "") return fallback;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? fallback : parsed;
}

export function safeFkInt(val: unknown): number | null {
  const parsed = safeInt(val, null);
  if (parsed === 0 || parsed === null) return null;
  return parsed;
}

export function safeFloat(
  val: unknown,
  fallback: number | null = null
): number | null {
  if (val === undefined || val === null || val === "") return fallback;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? fallback : parsed;
}

export function safeDate(val: unknown): Date | null {
  if (!val || val === "" || val === "0") return null;
  try {
    const d = new Date(val as string | number | Date);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function safeString(val: unknown): string | null {
  if (val === undefined || val === null || val === "") return null;
  return String(val).trim();
}

export function safeBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true";
  return Boolean(val);
}
