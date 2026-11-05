import { Request, Response, NextFunction } from "express";

interface StandardResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const errorLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let responseBody: StandardResponse | undefined;

  // Keep original res.json
  const originalJson = res.json.bind(res);

  // Override res.json to capture body
  res.json = (body: StandardResponse): Response => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    // Log only failed responses
    if (responseBody && responseBody.success === false) {
      console.error("--- API Error ---");
      console.error({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        message: responseBody.message,
        response: responseBody,
        time: new Date().toISOString(),
      });
    }
  });

  next();
};
