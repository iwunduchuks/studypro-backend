import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { apiResponse } from "../../../utils/apiResponse";

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const uploadDocuments = multer({
  storage: multer.memoryStorage(),
  limits: { files: MAX_FILES, fileSize: MAX_FILE_SIZE_BYTES },
}).array("files", MAX_FILES);

export const documentUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  uploadDocuments(req, res, (error: unknown) => {
    if (error instanceof MulterError) {
      res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json(
        apiResponse({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Uploaded file is too large"
              : `Invalid file upload: ${error.message}`,
        }),
      );
      return;
    }
    next(error);
  });
};
