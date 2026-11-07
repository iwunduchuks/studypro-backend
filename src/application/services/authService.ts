import { timingSafeEqual } from "node:crypto";
import type { TokenService } from "../interfaces/tokenService.interface.js";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid password");
    this.name = "InvalidCredentialsError";
  }
}

export class AuthService {
  constructor(
    private tokenService: TokenService,
    private password: string,
  ) {}

  login(password: string): { token: string } {
    if (!this.passwordMatches(password)) {
      throw new InvalidCredentialsError();
    }
    return { token: this.tokenService.sign() };
  }

  isValidToken(token: string): boolean {
    return this.tokenService.verify(token);
  }

  private passwordMatches(candidate: string): boolean {
    const expected = Buffer.from(this.password);
    const received = Buffer.from(candidate);
    return (
      expected.length === received.length && timingSafeEqual(expected, received)
    );
  }
}
