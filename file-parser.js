'use strict';

const Promise = require('promise');
const _ = require('underscore');

module.exports = parseFile;

function parseFile(file, fields, conds) {
  return new Promise((resolve, reject) => {
    let configuredParser = _.partial(parseRecord, _, fields, conds);

    let data = explode(file)
                 .map(JSON.parse)
                 .map(configuredParser)
                 .filter(notNull);

    resolve(data);
  });
}

function explode(str) {
  return str.substring(1, str.length - 1)
            .split('}{')
            .map(part => `{${part}}`);
}

function parseRecord(record, fields, conds) {
  let extractor = _.partial(extractFromRecord, record);

  let data = fields.map(extractor);

  let matches = _.chain(conds)
                 .map(cond => extractor(cond.field).match(cond.cond))
                 .compact()
                 .value()
                 .length;

  let fulfills = matches == conds.length;

  return fulfills ? data : null;
}

function notNull(variable) {
  return variable !== null;
}

function extractFromRecord(record, field) {
  let output = record;

  field.forEach(part => output = _.isObject(output) ? output[part] : '');

  return output;
}