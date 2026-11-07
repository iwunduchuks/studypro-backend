import { Request, Response } from "express";
import {
  AuthService,
  InvalidCredentialsError,
} from "../../../application/services/authService";

import { JwtTokenService } from "../../../infrastructure/jwt/jwtTokenService.js";
import { apiResponse } from "../../../utils/apiResponse.js";

const tokenService = new JwtTokenService(
  process.env.JWT_SECRET!,
  process.env.JWT_EXPIRES_IN as "7d" | undefined,
);
const authService = new AuthService(tokenService, process.env.AUTH_PASSWORD!);

export const loginController = (req: Request, res: Response): void => {
  const password = req.body?.password;

  if (typeof password !== "string" || password.length === 0) {
    res
      .status(400)
      .json(apiResponse({ success: false, message: "Password is required" }));
    return;
  }

  try {
    const { token } = authService.login(password);
    res.json(
      apiResponse({
        success: true,
        message: "Login successful",
        data: { token },
      }),
    );
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res
        .status(401)
        .json(apiResponse({ success: false, message: "Invalid password" }));
      return;
    }
    res
      .status(500)
      .json(apiResponse({ success: false, message: "Internal server error" }));
  }
};
