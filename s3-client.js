'use strict';

const AWS = require('aws-sdk'); 
const s3 = new AWS.S3();
const _ = require('underscore');

module.exports = {
  listFilesWithPrefix,
  downloadS3File
}

function listFilesWithPrefix(bucket, prefix) {
  return new Promise((resolve, reject) => {
    let params = { Bucket: bucket, Prefix: prefix };

    s3.listObjects(params, (err, data) => {
      if (err) reject(err);

      resolve(_.pluck(data.Contents, 'Key'));
    });
  });
}

function downloadS3File(bucket, file) {
  return new Promise((resolve, reject) => {
    let params = {
      Bucket: bucket,
      Key: file
    };

    s3.getObject(params, function(err, data) {
      if (err) reject(err);

      resolve(data);
    });
  });
}