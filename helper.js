'use strict';

const zlib = require('zlib');
const moment = require('moment');

module.exports = {
  extractFile,
  getDatesInRange
}

function extractFile(file) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(file.Body, function(err, dezipped) {
      if (err) reject(err);

      resolve(dezipped.toString());
    });
  });
}

function getDatesInRange(from, to) {
  let range = [];
  let mFrom = moment(from);
  let mTo = moment(to);

  while (mFrom.isSameOrBefore(mTo, 'day')) {
    range.push(mFrom.format('YYYY/MM/DD'));
    mFrom.add(1, 'd');
  }

  return range;
}