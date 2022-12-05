import DB from "@/databases";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";

class FileUploadController {
  public uploadPhoto = async (req: Request, res: Response) => {
    try {
      if (req.file) {
        res.status(200).json({ message: "image uploaded successfully!!" });
      }
    } catch (error) {
      logger.error(error);
    }
  };
  public uploadVideo = async (req: Request, res: Response) => {
    try {
      if (req.file) {
        res.status(200).json({ message: "video uploaded successfully!!" });
      }
    } catch (error) {
      logger.error(error);
    }
  };
}
export default FileUploadController;
