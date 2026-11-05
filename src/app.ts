import express from "express";
import { errorLogger } from "./interface/http/middleware/errorLogger.js";
import requestLogger from "./interface/http/middleware/requestLogger.js";
import userRouter from "./interface/http/router/userRouter.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use("/api", userRouter);

app.get("/", (req, res) => {
  res.json("Welcome to your Server");
});

export default app;
