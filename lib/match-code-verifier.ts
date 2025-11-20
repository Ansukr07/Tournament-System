const verificationCache = new Map<string, VerificationToken>()

export interface VerificationToken {
  code: string
  matchId: string
  issuedAt: number
  expiresAt: number
  attempts: number
  locked: boolean
}

const MAX_VERIFICATION_ATTEMPTS = 3
const CODE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Create a new verification token for a match
 */
export function createVerificationToken(matchId: string, code: string): VerificationToken {
  const token: VerificationToken = {
    code,
    matchId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + CODE_EXPIRY_MS,
    attempts: 0,
    locked: false,
  }

  verificationCache.set(matchId, token)
  return token
}

/**
 * Verify an umpire's match code
 */
export function verifyMatchCode(
  matchId: string,
  providedCode: string,
): {
  verified: boolean
  error?: string
} {
  const token = verificationCache.get(matchId)

  if (!token) {
    return { verified: false, error: "Match not found" }
  }

  if (token.locked) {
    return { verified: false, error: "Too many failed attempts. Try again later." }
  }

  if (Date.now() > token.expiresAt) {
    return { verified: false, error: "Code has expired" }
  }

  token.attempts++

  if (providedCode.toUpperCase() === token.code.toUpperCase()) {
    token.attempts = 0
    token.locked = false
    return { verified: true }
  }

  if (token.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    token.locked = true
    setTimeout(() => {
      token.locked = false
      token.attempts = 0
    }, LOCKOUT_DURATION_MS)
    return { verified: false, error: "Too many failed attempts. Please try again in 15 minutes." }
  }

  return { verified: false, error: `Incorrect code. ${MAX_VERIFICATION_ATTEMPTS - token.attempts} attempts remaining.` }
}

/**
 * Get remaining verification attempts for a match
 */
export function getVerificationAttempts(matchId: string): number {
  const token = verificationCache.get(matchId)
  if (!token) return MAX_VERIFICATION_ATTEMPTS
  return Math.max(0, MAX_VERIFICATION_ATTEMPTS - token.attempts)
}

/**
 * Check if verification is locked
 */
export function isVerificationLocked(matchId: string): boolean {
  const token = verificationCache.get(matchId)
  if (!token) return false
  return token.locked
}
