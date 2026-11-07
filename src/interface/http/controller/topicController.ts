import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import type { DocumentTextExtractor } from "../../../application/interfaces/documentTextExtractor.interface";
import { TopicService } from "../../../application/services/topicService";
import { Context } from "../../../domain/entities/context";
import { ClaudeTopicTitleGenerator } from "../../../infrastructure/ai/claudeTopicTitleGenerator";
import { DocxDocumentTextExtractor } from "../../../infrastructure/document/docxDocumentTextExtractor";
import { PdfDocumentTextExtractor } from "../../../infrastructure/document/pdfDocumentTextExtractor";
import { PrismaTopicRepository } from "../../../infrastructure/persistence/prisma/prismaTopicRepo";
import { apiResponse } from "../../../utils/apiResponse";

const topicRepository = new PrismaTopicRepository();
const topicTitleGenerator = new ClaudeTopicTitleGenerator();
const topicService = new TopicService(
  topicRepository,
  topicTitleGenerator,
);
const documentTextExtractors = new Map<string, DocumentTextExtractor>([
  [".pdf", new PdfDocumentTextExtractor()],
  [".docx", new DocxDocumentTextExtractor()],
]);

class InvalidContextError extends Error {}

// Combines the `context` body field with the text of any uploaded PDF/DOCX files.
const buildContextContent = async (
  req: Pick<Request, "body" | "files">,
): Promise<string> => {
  const text = req.body?.context;
  if (text !== undefined && typeof text !== "string") {
    throw new InvalidContextError("Context must be a string");
  }

  const parts: string[] = [];
  if (text && text.trim().length > 0) parts.push(text);

  const files = Array.isArray(req.files) ? req.files : [];
  for (const file of files) {
    const extractor = documentTextExtractors.get(
      extname(file.originalname).toLowerCase(),
    );
    if (!extractor) {
      throw new InvalidContextError(
        `Unsupported file "${file.originalname}": only PDF and DOCX files are accepted`,
      );
    }

    let extracted: string;
    try {
      extracted = await extractor.extractText(file.buffer);
    } catch {
      throw new InvalidContextError(
        `Unable to extract text from "${file.originalname}"`,
      );
    }
    if (extracted.trim().length > 0) parts.push(extracted);
  }

  const content = parts.join("\n\n");
  if (content.length === 0) {
    throw new InvalidContextError("Context is required");
  }
  return content;
};

const respondInvalidContext = (res: Response, error: InvalidContextError) =>
  res
    .status(400)
    .json(apiResponse({ success: false, message: error.message }));

export const getTopicsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const topics = await topicRepository.findAll();
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
    const topic = await topicRepository.findById(req.params.id);
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
    const content = await buildContextContent(req);
    const topic = await topicService.create(content);

    res.status(201).json(
      apiResponse({
        success: true,
        message: "Topic created",
        data: topic,
      }),
    );
  } catch (error) {
    if (error instanceof InvalidContextError) {
      respondInvalidContext(res, error);
      return;
    }
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

export const addTopicContextController = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const content = await buildContextContent(req);
    const topic = await topicRepository.findById(req.params.id);
    if (!topic) {
      res
        .status(404)
        .json(apiResponse({ success: false, message: "Topic not found" }));
      return;
    }

    const title = await topicTitleGenerator.generate(content, "long");
    topic.addContext(new Context(randomUUID(), title, content, [], []));
    const updatedTopic = await topicRepository.save(topic);

    res.status(201).json(
      apiResponse({
        success: true,
        message: "Context added",
        data: updatedTopic,
      }),
    );
  } catch (error) {
    if (error instanceof InvalidContextError) {
      respondInvalidContext(res, error);
      return;
    }
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

export const deleteTopicContextController = async (
  req: Request<{ id: string; contextId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const topic = await topicRepository.findById(req.params.id);
    if (!topic) {
      res
        .status(404)
        .json(apiResponse({ success: false, message: "Topic not found" }));
      return;
    }
    if (!topic.removeContext(req.params.contextId)) {
      res
        .status(404)
        .json(apiResponse({ success: false, message: "Context not found" }));
      return;
    }

    const updatedTopic = await topicRepository.save(topic);
    res.status(200).json(
      apiResponse({
        success: true,
        message: "Context deleted",
        data: updatedTopic,
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
    const removed = await topicRepository.remove(req.params.id);
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
