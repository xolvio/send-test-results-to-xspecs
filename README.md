# Send Test Results To XSpecs

Send test results from CI to XSpecs so you can see your specs on your issue tickets.

## Usage as a project dependency

Install it as a dev dependency:

```
npm install --save-dev send-test-results-to-xspecs
```

Run it after your test artifacts have been created

```
./node_modules/.bin/send-test-results-to-xspecs --server my-xspecs.my-server.com junit/test-results.xml cucumber/tests.cucumber
```

## Usage as a global module

Install it as a global dependency:

```
npm install --global send-test-results-to-xspecs
```

Run it after your test artifacts have been created

```
send-test-results-to-xspecs --server my-xspecs.my-server.com junit/test-results.xml cucumber/tests.cucumber
```

## Environment Variables

Automatically picks up on env variables from circle ci currently to tag your test results 
with the correct commit sha, build number, and branch. If you use some other CI provider
just be sure to set each of the circle variables as appropriate. You can also specify the
xspecs host via env variable if you don't want to specify it as a command line parameter.

| Variable            | Description                                       |
| CIRCLE_SHA1         | The sha1 hash of the commit for the current build |
| CIRCLE_BUILD_NUM    | The build number for the current build            |
| CIRCLE_BRANCH       | The branch for the current build                  |
| XSPECS_HOST         | The server you want to post results to            |

