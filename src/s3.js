const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

class S3Client {
  constructor() {
    this.s3 = new AWS.S3();
  }

  uploadImage(params) {
    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  updateImage(params) {
    return new Promise((resolve, reject) => {
      this.s3.copyObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  deleteImage(params) {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Add more methods for interacting with S3 as needed...
}

module.exports = new S3Client();

