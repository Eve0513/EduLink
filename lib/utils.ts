import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "acum";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} luni`;
  
  const years = Math.floor(months / 12);
  return `${years} ani`;
}