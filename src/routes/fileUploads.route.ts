import { Router } from "express";
import {uploadFiles }from "@/rest/fileUpload";
import { Routes } from "@interfaces/routes.interface";
import FileUploadController from "@/controllers/fileUpload.controller";

class FileUploadRoute implements Routes {
  public path = "/";
  public router = Router();
  public fileUploadController = new FileUploadController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}uploadProfile`,
      uploadFiles.single("image"),
      this.fileUploadController.uploadPhoto
    );
    this.router.post(
      `${this.path}uploadVideo`,
      uploadFiles.single("video"),
      this.fileUploadController.uploadVideo
    );
  }
}
export default FileUploadRoute;
