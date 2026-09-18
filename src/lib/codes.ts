import { randomBytes, randomInt } from "crypto";

/**
 * Public token embedded in the QR code URL. Long and random so it cannot be
 * guessed or brute-forced, but contains no information about the owner.
 */
export function generatePublicToken(): string {
  return randomBytes(24).toString("base64url");
}

// Ambiguous characters (0/O, 1/I/L) are excluded so a human can retype the
// code correctly after reading it off a printed tag.
const RECOVERY_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const RECOVERY_CODE_LENGTH = 6;

/**
 * Short human-readable recovery code, e.g. "7K2M9P", for the /recover page.
 */
export function generateRecoveryCode(): string {
  let code = "";
  for (let i = 0; i < RECOVERY_CODE_LENGTH; i++) {
    code += RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)];
  }
  return code;
}

/** Normalizes user-typed recovery codes (case/whitespace) before lookup. */
export function normalizeRecoveryCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
