import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "acum cateva secunde";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `acum ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `acum ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `acum ${days} zile`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `acum ${weeks} sapt.`;
  const months = Math.floor(days / 30);
  if (months < 12) return `acum ${months} luni`;
  return `acum ${Math.floor(days / 365)} ani`;
}
