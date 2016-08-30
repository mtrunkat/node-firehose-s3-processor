'use strict';

const program = require('commander');
const _ = require('underscore');
const Promise = require('promise');
const pool = require('generic-promise-pool');
const fs = require('fs');

const fileParser = require('./file-parser');
const s3Client = require('./s3-client');
const configParser = require('./config-parser');
const helper = require('./helper');

program
  .arguments('<bucket>')
  .option('-f, --date-from [string]', 'From date [2016-04-01]')
  .option('-t, --date-to [string]', 'To date [2016-04-02]')
  .option('-F, --fields [string]', 'Fields to be extracted [name,date,search.query]')
  .option('-C, --conditions [string]', 'Conditions [name=John,gl=uk]', '')
  .option('-p, --pool [integer]', 'Number of parallel files processed [20]', 20)
  .option('-o, --out [string]', 'Output file name [output.csv]', 'output.csv')
  .parse(process.argv);

if (!program.dateFrom) throw '--date-from parameter required';
if (!program.dateTo) throw '--date-to parameter required';
if (!program.fields) throw '--fields parameter required';
if (!program.args[0]) throw '<bucket> argument required';

const bucket = program.args[0];
const fields = configParser.parseFields(program.fields);
const conds = configParser.parseConditions(program.conditions);
const fileProcessPool = pool.create({ max: program.pool, create: () => new Object, destroy: () => new Object });
const wstream = fs.createWriteStream(program.out);

console.log(`
  Bucket: ${bucket}
  From: ${program.dateFrom}
  To: ${program.dateTo}
  Fields: ${program.fields}
  Conditions: ${program.conditions}
  Pool: ${program.pool}
  Output: ${program.out}
`);

const configuredFileParser = _.partial(fileParser, _, fields, conds);
const configuredS3Client = _.mapObject(s3Client, method => _.partial(method, bucket, _));

writeHeaderLine()
  .then(listFiles, error)
  .then(processFiles, error)
  .then(done, error);

function writeHeaderLine() {
  return saveRecords([ program.fields.split(',') ]);
}

function listFiles() {
  return new Promise((resolve, reject) => {
    let promises = helper.getDatesInRange(program.dateFrom, program.dateTo)
                         .map(date => configuredS3Client.listFilesWithPrefix(date));

    Promise.all(promises)
           .then(resolve, reject);
  });
}

function processFiles(files) {
  return new Promise((resolve, reject) => {
    files = _.union.apply(this, files);

    console.log(`Starting download of ${files.length} files from S3.`);

    let promises = files.map((file) => {
      return fileProcessPool.acquire(() => processFile(file));
    });

    Promise.all(promises)
           .then(() => fileProcessPool.drain(), reject)
           .then(resolve, reject);
  });
}

function processFile(file) {
  return configuredS3Client.downloadS3File(file)
           .then(helper.extractFile, error)
           .then(configuredFileParser, error)
           .then(saveRecords)
           .then(() => console.log(`File ${file} done.`));
}

function saveRecords(data) {
  return new Promise((resolve, reject) => {
    let str = data.map(line => line.join(';'))
                  .join("\n");

    wstream.write(str + "\n", resolve);
  });
}

function done() {
  console.log('DONE.');
  wstream.end();
}

function error(err) {
  console.log('ERROR:');
  console.log(err, err.stack);
  wstream.end();
}
