require('dotenv').config();
import { CONSTANTS } from '@/constants';
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import sharp from 'sharp';
import { logger } from '../logger';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// UPLOAD FILE TO S3
// const uploadParam = Object.values(files).map((file, index) => {
//   const obj = file[0];
//   return {
//     Bucket: bucketName,
//     Body: obj.path,
//     Key: obj.filename,
//   };
// });
// // return s3.upload(uploadParams).promise();
// return Promise.all(uploadParam.map((param) => console.log(param)));
// =======
// function uploadFileS3(file) {
//   const fileStream = fs.createReadStream(file.path);

//   const uploadParams = {
//     Bucket: bucketName,
//     Body: fileStream,
//     Key: file.filename,
//   };

// return s3.upload(uploadParams).promise();
// }

// DOWNLOAD FILE FROM S3
// function getFileStream(fileKey) {
//   const downloadParams = {
//     Key: fileKey,
//     Bucket: bucketName,
//   };

//   return s3.getObject(downloadParams).createReadStream();
// }

// UPLOAD FILE TO S3
export async function uploadFileS3(file) {
  let data;
  if (file.originalname.match(/\.(png|jpg|jpeg)$/)) {
    //image Compression
    const image = sharp(file.path);
    data = await image.metadata().then(function (metadata) {
      if (metadata.width > CONSTANTS.IMAGE_WIDTH) {
        return image.resize({ width: CONSTANTS.IMAGE_WIDTH }).toBuffer(); // resize if too big
      } else {
        return image.toBuffer();
      }
    });
    const result = await bucketUpload(data, file);
    return result;
  } else {
    const data = fs.createReadStream(file.path);
    const result = await bucketUpload(data, file);
    return result;
  }
}
async function bucketUpload(data, file) {
  const uploadParams = {
    Bucket: bucketName,
    Body: data,
    Key: file.filename,
    ACL: 'public-read',
  };
  try {
    const result = await s3.upload(uploadParams).promise();
    return result;
  } catch (err) {
    console.log(err);
  }
}

// DOWNLOAD FILE FROM S3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}
//DELETE FILE FROM S3
async function deleteFromS3(filename) {
  try {
    const params = {
      Bucket: bucketName,
      Key: filename,
    };
    await s3.headObject(params).promise();
    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
      logger.info('Error in file Deletion : ' + JSON.stringify(err));
    }
  } catch (err) {
    logger.info('File not Found Error : ' + err.code);
  }
}

export { getFileStream, deleteFromS3 };
