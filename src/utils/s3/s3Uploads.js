require('dotenv').config();
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');

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
function uploadFileS3(file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

// DOWNLOAD FILE FROM S3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

module.exports = { uploadFileS3, getFileStream };
