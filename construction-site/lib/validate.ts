export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
}

export function validateRequired(fields: Record<string, unknown>): string[] {
  return Object.entries(fields)
    .filter(([, v]) => !v || (typeof v === "string" && v.trim() === ""))
    .map(([k]) => k);
}
