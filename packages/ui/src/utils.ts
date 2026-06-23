import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes with proper precedence
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
