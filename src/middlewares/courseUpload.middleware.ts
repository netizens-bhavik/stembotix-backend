import { logger } from '@/utils/logger';
import { uploadFileS3 } from '@/utils/s3/s3Uploads';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';

export const courseUploadFile = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    if (!(request.files || request.file)) {
      next();
    }
    if (request.files['thumbnail']) {
      const file = request.files['thumbnail'][0];
      const filePath = file.path;
      const result = await uploadFileS3(file);
      request.files['thumbnail'][0].path = await result.Location;
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(err);
          return;
        }
      });
    }
    if (request.files['trailer']) {
      const file = request.files['trailer'][0];
      const filePath = file.path;
      const result = await uploadFileS3(file);
      request.files['trailer'][0].path = await result.Location;

      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(err);
          return;
        }
      });
    }
    next();
  } catch (error) {
    logger.error(error);
  }
};
