import { Router } from "express";
import {
  createTopicController,
  deleteTopicController,
  getTopicController,
  getTopicsController,
  updateTopicController,
} from "../controller/topicController";

const router = Router();

router.get("/", getTopicsController);
router.get("/:id", getTopicController);
router.post("/", createTopicController);
router.delete("/:id", deleteTopicController);
router.put("/:id", updateTopicController);

export default router;
