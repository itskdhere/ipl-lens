import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlayingRole(role?: string | null): string {
  if (!role) return "";
  const lower = role.toLowerCase().trim();
  if (lower === "bat" || lower === "batsman") return "Batsman";
  if (lower === "bowl" || lower === "bowler") return "Bowler";
  if (lower === "all" || lower === "allrounder" || lower === "all-rounder")
    return "All-rounder";
  if (lower === "wk" || lower === "keeper" || lower === "wicketkeeper")
    return "Wicketkeeper";
  return role;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function formatDate(
  dateInput?: string | Date | null,
  options?: { includeTime?: boolean }
): string {
  if (!dateInput) return "N/A";

  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    const cleanStr = String(dateInput).trim().replace(" ", "T");
    date = new Date(cleanStr);
  }

  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).formatToParts(date);

  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const dayOrdinal = getOrdinalSuffix(parseInt(map.day || "0", 10));
  const hour = map.hour === "24" ? "00" : map.hour;
  const includeTime = options?.includeTime ?? true;

  if (includeTime && hour && map.minute) {
    return `${dayOrdinal} ${map.month} ${map.year}, ${hour}:${map.minute}`;
  }

  return `${dayOrdinal} ${map.month} ${map.year}`;
}
