# Tool to process S3 dumps of JSON records made with AWS Kinesis Firehose

If you are using AWS Kinesis Firehose [https://aws.amazon.com/kinesis/firehose/](https://aws.amazon.com/kinesis/firehose/) to stream JSON records into some S3 bucket then this bucket contains some files in directories named based on the date of creation:

```
2016/04/01/00/aaa-2-2016-04-01-00-11-51-9c03f701-5a59-4b3e-9c49-b34c1c84b68c.gz
2016/04/01/04/bbb-2-2016-04-01-04-57-10-d70d8ee6-7369-446e-8047-b3341f532be8.gz
2016/04/01/05/ccc-2-2016-04-01-05-12-11-b2902d59-5193-4e6a-ac3d-ff971dca5910.gz
...
```
where each file contains a sequence of JSON records:

```
{-1st json record-}{-2nd json record-}...{-Nth json record-}
```

You can use this tool to export some fields from all JSON records that satisfies certain condition as CSV file. For example if each JSON record has following format:

```json
{
  "username": "David"
  "event": {
    "time": "2016/12/10 23:30"
    "name": "some event"
    ...
  }
  ...
}
```
then you can export CSV file containing username and time for each record with event name equal to "login". Call:

```
node index.js -f 2016-04-01 -t 2016-04-01 -F username,event.time -C event.name=login some-bucket
```
to get:

```
username;event.time
David;2016/12/10 23:30
John;2016/12/10 23:45
...
```


## Installation

Install npm dependencies:

```
npm install
```

## Usage

```
  Usage: index [options] <bucket>

  Options:

    -h, --help                 output usage information
    -f, --date-from [string]   From date [2016-04-01]
    -t, --date-to [string]     To date [2016-04-02]
    -F, --fields [string]      Fields to be extracted [name,date,search.query]
    -C, --conditions [string]  Conditions [name=John,gl=uk]
    -p, --pool [integer]       Number of parallel files processed [20]
    -o, --out [string]         Output file name [output.csv]
```

Options --date-from, --date-to, --fields are required.