import { Request, Response } from "express";
import { TopicService } from "../../../application/services/topicService";
import { ClaudeTopicTitleGenerator } from "../../../infrastructure/ai/claudeTopicTitleGenerator";
import { PrismaTopicRepository } from "../../../infrastructure/persistence/prisma/prismaTopicRepo";
import { apiResponse } from "../../../utils/apiResponse";

const topicService = new TopicService(
  new PrismaTopicRepository(),
  new ClaudeTopicTitleGenerator(),
);

export const getTopicsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const topics = await topicService.findAll();
    res.status(200).json(
      apiResponse({
        success: true,
        message: "Topics retrieved",
        data: topics,
      }),
    );
  } catch (error) {
    console.error("Topic request failed:", error);
    res.status(500).json(
      apiResponse({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error,
      }),
    );
  }
};

export const getTopicController = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const topic = await topicService.findById(req.params.id);
    if (!topic) {
      res
        .status(404)
        .json(apiResponse({ success: false, message: "Topic not found" }));
      return;
    }
    res.status(200).json(
      apiResponse({
        success: true,
        message: "Topic retrieved",
        data: topic,
      }),
    );
  } catch (error) {
    console.error("Topic request failed:", error);
    res.status(500).json(
      apiResponse({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error,
      }),
    );
  }
};

export const createTopicController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const content = req.body?.context;
    if (typeof content !== "string" || content.trim().length === 0) {
      res
        .status(400)
        .json(apiResponse({ success: false, message: "Context is required" }));
      return;
    }

    const topic = await topicService.create(content);

    res.status(201).json(
      apiResponse({
        success: true,
        message: "Topic created",
        data: topic,
      }),
    );
  } catch (error) {
    console.error("Topic request failed:", error);
    res.status(500).json(
      apiResponse({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error,
      }),
    );
  }
};

export const updateTopicController = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const title = req.body?.title;
    if (typeof title !== "string" || title.trim().length === 0) {
      res
        .status(400)
        .json(apiResponse({ success: false, message: "Title is required" }));
      return;
    }

    const topic = await topicService.updateTitle(req.params.id, title);
    if (!topic) {
      res
        .status(404)
        .json(apiResponse({ success: false, message: "Topic not found" }));
      return;
    }
    res.status(200).json(
      apiResponse({
        success: true,
        message: "Topic updated",
        data: topic,
      }),
    );
  } catch (error) {
    console.error("Topic request failed:", error);
    res.status(500).json(
      apiResponse({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error,
      }),
    );
  }
};

export const deleteTopicController = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const removed = await topicService.remove(req.params.id);
    if (!removed) {
      res
        .status(404)
        .json(apiResponse({ success: false, message: "Topic not found" }));
      return;
    }
    res.status(200).json(
      apiResponse({
        success: true,
        message: "Topic deleted",
      }),
    );
  } catch (error) {
    console.error("Topic request failed:", error);
    res.status(500).json(
      apiResponse({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error,
      }),
    );
  }
};
