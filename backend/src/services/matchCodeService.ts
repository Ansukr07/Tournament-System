import crypto from "crypto"

export class MatchCodeService {
  // Generate 8-character secure code
  static generateCode(): string {
    return crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 8)
  }

  // Hash code for storage
  static hashCode(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex")
  }

  // Verify code against hash
  static verifyCode(plainCode: string, hash: string): boolean {
    return this.hashCode(plainCode) === hash
  }

  // Generate JWT token for verified match
  static generateMatchToken(matchId: string, secret: string): string {
    const payload = {
      matchId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    }

    // Simple JWT (in production, use jsonwebtoken library)
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64")
    const body = Buffer.from(JSON.stringify(payload)).toString("base64")
    const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64")

    return `${header}.${body}.${signature}`
  }
}
