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
  }).option('debug', {
    alias: ['d', 'debug'],
    type: 'boolean',
    describe: 'to debug or not to debug',
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

    var fileContent = fs.readFileSync(file, 'utf8');

    var data = JSON.stringify({
      commitSha: options.commit,
      organizationId: options.organization,
      repositoryLocation: options.repository,
      branchName: options.branch,
      results: fileContent
    });

    if (options.debug) {
      console.log('Sending:', {
        hostname: options.server,
        commitSha: options.commit,
        organizationId: options.organization,
        repositoryLocation: options.repository,
        branchName: options.branch,
        results: fileContent
      });
    }

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
  if (process.env.CIRCLE_CI) {
    return "circle";
  }
  if (process.env.BUILD_ID) {
    return "jenkins";
  }
  return "";
}
function getBranchFromCI() {
  if (getCIEnv() == "circle") {
    return process.env.CIRCLE_BRANCH;
  }
  if (getCIEnv() == "jenkins") {
    return process.env.GIT_BRANCH.replace(/^origin\//, '');
  }
  return "";
}
function getCommitFromCI() {
  if (getCIEnv() == "circle") {
    return process.env.CIRCLE_SHA1;
  }
  if (getCIEnv() == "jenkins") {
    return process.env.GIT_COMMIT;
  }
  return "";
}
function getNumberFromCI() {
  if (getCIEnv() == "circle") {
    return process.env.CIRCLE_BUILD_NUM;
  }
  if (getCIEnv() == "jenkins") {
    return process.env.BUILD_NUMBER;
  }
  return "";
}

main(args).then(function (result) {
  console.log(result);
}).catch(function (error) {
  console.log(error);
});
