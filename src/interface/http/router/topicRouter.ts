import { Router } from "express";
import {
  addTopicContextController,
  createTopicController,
  deleteTopicController,
  deleteTopicContextController,
  getTopicController,
  getTopicsController,
  updateTopicController,
} from "../controller/topicController";
import { documentUploadMiddleware } from "../middleware/documentUploadMiddleware";

const router = Router();

router.get("/", getTopicsController);
router.get("/:id", getTopicController);
router.post("/", documentUploadMiddleware, createTopicController);
router.post(
  "/:id/context",
  documentUploadMiddleware,
  addTopicContextController,
);
router.delete("/:id/context/:contextId", deleteTopicContextController);
router.delete("/:id", deleteTopicController);
router.put("/:id", updateTopicController);

export default router;
