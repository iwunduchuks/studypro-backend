import jwt from "jsonwebtoken";
import type { TokenService } from "../../application/interfaces/tokenService.interface.js";

export class JwtTokenService implements TokenService {
  constructor(
    private secret: string,
    private expiresIn: jwt.SignOptions["expiresIn"] = "7d",
  ) {
    if (secret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters long");
    }
  }

  sign(): string {
    return jwt.sign({}, this.secret, {
      algorithm: "HS256",
      expiresIn: this.expiresIn,
    });
  }

  verify(token: string): boolean {
    try {
      jwt.verify(token, this.secret, { algorithms: ["HS256"] });
      return true;
    } catch {
      return false;
    }
  }
}
