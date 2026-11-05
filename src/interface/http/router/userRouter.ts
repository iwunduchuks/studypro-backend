import { Router } from "express";
import { UserController } from "../controller/userController";
import { UserService } from "../../../application/userService";
import { InMemoryUserRepository } from "../../../infrastructure/inMemory/inMemoryUserRepo";

const userRepository = new InMemoryUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

router.get("/users", (req, res) => userController.getAllUsers(req, res));
router.get("/boss", (req, res) => userController.getBoss(req, res));

export default router;
