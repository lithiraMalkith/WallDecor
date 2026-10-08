// ============================================================================
// Ceylon Wall Decor — Shared Utilities
// ============================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes cleanly without conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount to Sri Lankan Rupee standard (no decimal cents)
 * Example: 3500 -> "Rs. 3,500"
 */
export function formatPrice(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "Rs. 0";
  }
  return `Rs. ${Math.round(amount).toLocaleString("en-LK")}`;
}

/**
 * Calculates frame cost based on dimensions and rate per square inch
 * Ceylon Wall Decor rule: width * height * rate (default Rs. 6/sq in)
 */
export function calculateFramePrice(
  width: number,
  height: number,
  ratePerSqInch: number = 6,
): number {
  if (!width || !height || width <= 0 || height <= 0) return 0;
  const area = width * height;
  return Math.round(area * ratePerSqInch);
}

/**
 * Generates clean URL slug from title string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Generates an uppercase SKU
 * Example: ("Golden Rise", "12×16") -> "CWD-GOLDEN-RISE-12X16"
 */
export function generateSKU(name: string, sizeLabel?: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  if (sizeLabel) {
    const size = sizeLabel.toUpperCase().replace(/[×x]/g, "X");
    return `CWD-${base}-${size}`;
  }
  return `CWD-${base}`;
}

/**
 * Generates sequential formatted order reference
 * Example: 42 -> "CWD-000042"
 */
export function generateOrderRef(numberOrId?: number | string): string {
  if (typeof numberOrId === "number") {
    return `CWD-${String(numberOrId).padStart(6, "0")}`;
  }
  if (typeof numberOrId === "string" && numberOrId.startsWith("CWD-")) {
    return numberOrId;
  }
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `CWD-${randomSuffix}`;
}

/**
 * Formats a Sri Lankan phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Formats date into readable Sri Lankan format
 */
export function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats date + time for audit logs and order timestamps
 */
export function formatDateTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
