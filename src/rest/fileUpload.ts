import multer from "multer";
import { Request } from "express";
import path from "path";
import { existsSync, mkdirSync } from "fs";
const publicFs = path.join(__dirname, "../public");
var filePath: DestinationCallback | any = "";
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const fileStorage = multer.diskStorage({
  //Destination to store files
  destination(req, file, cb) {
    const folder = path.join(publicFs, `/${file.fieldname}`);
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
    console.log(`${uploadFile}`);
  },
});

const uploadFiles = multer({
  storage: fileStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter(req: Request, file: Express.Multer.File, cb: FileNameCallback) {
    filePath = req.url.slice(1);
    if (
      !file.originalname.match(
        /\.(png|jpg|jpeg|xlsx|xlx|doc|txt|xls|pdf|docx|ppt|pptx|csv|svg|mp4)$/
      )
    ) {
      return cb(new Error("Please upload a Image"), null);
    }
    //@ts-ignore:
    cb(undefined, true);
  },
});

export default uploadFiles;
