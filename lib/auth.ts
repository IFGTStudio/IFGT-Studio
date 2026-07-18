export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(value: string) {
  return value.replace(/[^a-z0-9_]/g, "").toLowerCase().slice(0, 20);
}

export function isValidUsername(value: string) {
  return USERNAME_REGEX.test(value);
}

export function getUsernameIssues(value: string) {
  const issues: string[] = [];

  if (value.length < 3 || value.length > 20) {
    issues.push("3-20 karakter olmalı.");
  }

  if (/[A-Z]/.test(value)) {
    issues.push("Büyük harf kullanılamaz.");
  }

  if (/\s/.test(value)) {
    issues.push("Boşluk kullanılamaz.");
  }

  if (/[çğıöşüÇĞİÖŞÜ]/.test(value)) {
    issues.push("Türkçe karakter kullanılamaz.");
  }

  if (/[^a-zA-Z0-9_\sçğıöşüÇĞİÖŞÜ]/.test(value)) {
    issues.push("Sadece a-z, 0-9 ve _ kullanılabilir.");
  }

  if (!issues.length && !USERNAME_REGEX.test(value)) {
    issues.push("Sadece a-z, 0-9 ve _ kullanılabilir.");
  }

  return issues;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 4) return "strong";
  if (score >= 2) return "medium";
  return "weak";
}
