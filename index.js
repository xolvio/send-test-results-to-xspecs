var fs = require('fs');
var https = require('https');

var args = require('yargs')
  .option('server', {
    alias: 's',
    type: 'string',
    describe: 'your xspecs server host name',
    required: true,
  }).option('organization', {
    alias: 'o',
    type: 'string',
    describe: 'the project organization',
    required: true,
  }).option('repository', {
    alias: 'r',
    type: 'string',
    describe: 'the project repository',
    required: true,
  }).option('branch', {
    alias: 'b',
    type: 'string',
    describe: 'the current git branch',
  }).option('commit', {
    alias: ['c', 'sha1'],
    type: 'string',
    describe: 'the current commit sha',
  }).option('number', {
    alias: ['n', 'build-number'],
    type: 'string',
    describe: 'the current ci build number or id',
  })
  .env('XSPECS')
  .strict()
  .argv
  ;

function main(args) {
  // TODO: bail if ! process.env.CI
  args = normalizeOptions(args);
  return Promise.all(args._.map(function (file) {
    return postTestResultsFileToServer(file, args);
  }));
}

function normalizeOptions(opts) {
  if (! opts.branch) {
    opts.branch = getBranchFromCI();
  }
  if (! opts.commit) {
    opts.commit = getCommitFromCI();
  }
  if (! opts.number) {
    opts.number = getNumberFromCI();
  }
  return opts;
}

function postTestResultsFileToServer(file, options) {
  return new Promise((resolve, reject) => {
    if (! fs.existsSync(file)) {
      reject(new Error('File does not exist: ' + file));
    }

    var data = JSON.stringify({
      commitSha: options.commit,
      organizationId: options.organization,
      repositoryLocation: options.repository,
      branchName: options.branch,
      results: fs.readFileSync(file, 'utf8'),
    });
    
    var request = https.request({
      method: 'POST',
      hostname: options.server,
      path: '/RecieveTestResultsCommand',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (response) => {
      var body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          process.stderr.write(`Response Code: ${response.statusCode} \n`);
          process.stderr.write(`Response Body: ${body.join('')} \n`);
          reject(new Error('Server returned an error, see response code & body above.'));
        } else {
          resolve(JSON.parse(body.join('')));            
        }
      });
    });

    request.on('error', (err) => {
      process.stderr.write(`An error occured: ${err.stack} \n`);
      reject(new Error('An unknown error occured, see the error above.'));
    });

    request.write(data);
    request.end();
  });
}

function getCIEnv() {
  return process.env.CIRCLE_CI ? "circle" : "";
}
function getBranchFromCI() {
  if (getCIEnv() == "circle") {
    return process.env.CIRCLE_BRANCH;
  }
  return "";
}
function getCommitFromCI() {
  if (getCIEnv() == "circle") {
    return process.env.CIRCLE_SHA1;
  }
  return "";
}
function getNumberFromCI() {
  if (getCIEnv() == "circle") {
    return process.env.CIRCLE_BUILD_NUM;
  }
  return "";
}

main(args).then(function (result) {
  console.log(result);
}).catch(function (error) {
  console.log(error);
});
