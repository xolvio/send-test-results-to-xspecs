# Send Test Results To XSpecs

Send test results from CI to XSpecs so you can see your specs on your issue tickets.

## Usage as a project dependency

Install it as a dev dependency:

```
npm install --save-dev xspecs-cli
```

Run it after your test artifacts have been created

```
./node_modules/.bin/xspecs-cli --server my-xspecs.my-server.com junit/test-results.xml cucumber/tests.cucumber
```

## Usage as a global module

Install it as a global dependency:

```
npm install --global xspecs-cli
```

Run it after your test artifacts have been created

```
xspecs-cli --server my-xspecs.my-server.com junit/test-results.xml cucumber/tests.cucumber
```

## Command line arguments

Run `xspecs-cli --help` for help on command line arguments.

Each command line argument can be optionally supplied as an environment variable by pre-pending `XSPECS_`, eg. `XSPECS_BRANCH=master`.

## Environment variables

Environment variables from circle ci & jenkins are automatically parsed and applied to the relevant command line arguments (branch, sha1, build number). If your CI doesn't provide those variables you can manually specify the correct values on the command line.


