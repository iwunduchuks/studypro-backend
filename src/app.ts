import express from "express";
import { errorLogger } from "./interface/http/middleware/errorLogger.js";
import requestLogger from "./interface/http/middleware/requestLogger.js";
import authRouter from "./interface/http/router/authRouter.js";
import { authMiddleware } from "./interface/http/middleware/authMiddleware.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use("/api/auth", authRouter);

app.get("/", authMiddleware, (req, res) => {
  res.json("Welcome to your Server");
});

export default app;
