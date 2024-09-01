import crypto from "crypto";
import jwt from "jsonwebtoken";

interface TokenPayload {
  tid: string;
  exp: number;
  permissions: string[];
}

export class TokenUtils {
  static generateAccessToken(tokenId: string, expiresAtStr: Date, permissions: string[]): string {
    const expiresAt = new Date(expiresAtStr);

    const payload: TokenPayload = {
      tid: tokenId,
      exp: expiresAt.getTime(),
      permissions: permissions,
    };
    const TOKEN_SECRET = process.env.TOKEN_SECRET;

    if (TOKEN_SECRET === undefined) throw new Error("TOKEN_SECRET is undefined");

    return jwt.sign(payload, TOKEN_SECRET);
  }

  static verifyAndDecodeAccessToken(token: string): TokenPayload | null {
    try {
      const TOKEN_SECRET = process.env.TOKEN_SECRET;
      if (TOKEN_SECRET === undefined) throw new Error("TOKEN_SECRET is undefined");

      const decoded = jwt.verify(token, TOKEN_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static generateTokenId(): string {
    return crypto.randomBytes(16).toString("hex");
  }
}
