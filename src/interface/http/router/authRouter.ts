import { Router } from "express";
import { loginController } from "../controller/authController.js";

const router = Router();

router.post("/login", loginController);

export default router;
