import { Request, Response } from "express";
import { UserService } from "../../../application/userService";

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getBoss(req: Request, res: Response): Promise<void> {
    try {
      const boss = await this.userService.getBoss();
      if (boss) {
        res.json(boss);
      } else {
        res.status(404).json({ error: "Boss not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
