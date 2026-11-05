import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../../application/authService.js";
import { JwtTokenService } from "../../../infrastructure/jwt/jwtTokenService.js";

const tokenService = new JwtTokenService(
  process.env.JWT_SECRET!,
  process.env.JWT_EXPIRES_IN as "7d" | undefined,
);
const authService = new AuthService(tokenService, process.env.AUTH_PASSWORD!);

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token || !authService.isValidToken(token)) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  next();
};
