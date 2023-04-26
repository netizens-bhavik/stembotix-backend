import { NextFunction, Request, Response } from 'express';
import { uploadFileS3 } from '@/utils/s3/s3Uploads';
import * as fs from 'fs';
import { logger } from '@/utils/logger';
export const imageUpload = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    //for a single File
    if (!(request.file || request.files)) {
      next();
    }

    //For Bulk Upload
    if (request.files) {
      await Promise.all(
        request.files.map(async (file: Express.Multer.File, index) => {
          const filePath = file.path;
          let result;
          try {
            // result = await uploadFileS3(file);
          } catch (error) {
            logger.error(error);
          }

          request.files[index].awsPath = await result.Location;
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error(err);
              return;
            }
          });
        })
      );
      next();
    } else if (request.file) {
      const filePath = request.file.path;
      const result = await uploadFileS3(request.file);
      request.file.path = result.Location;
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(err);
          return;
        }
      });
      next();
    }
  } catch (error) {
    logger.error(error);
  }
};
