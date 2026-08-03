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
