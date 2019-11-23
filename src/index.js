const path = require('path')
const program = require('commander');
const { branchOutRemote } = require(path.join(__dirname, '../src/branch-out-remote'))
const { tagRemote } = require(path.join(__dirname, '../src/tag-remote'))

// Local(s):
const commandName = "tbd-release-utils";

// Common setup for program:
program
  .option('-v, --verbose', 'output extra debugging');

// Command 1: af5c1f1815b65a34a21993adec7064f9ac2d9a9e
program
    .command("branch-out <target-repo>")
    .description('Create a release branch on remote repo. TARGET-REPO should be in format (:owner/:repo) EG.: nodejs/node-gyp')
    .requiredOption("-t, --github-token <github-token>", "Your github token")
    .requiredOption("-s, --source-revision-sha <source-revision-sha/branch-name>", "source-revision-sha or the branch you want to branch out from", "master")
    .requiredOption("-d, --destination-repo <destination-repo>", "the destination-repo", "release")
    .action(function (targetRepo, options) {
        branchOutRemote(options.githubToken, targetRepo, options.sourceRevisionSha, options.destinationRepo);
    });

// Command 2:
program
    .command('tag <target-repo>')
    .description('Create a tag on remote repo.')
    .requiredOption("-t, --github-token <github-token>", "Your github token")
    .requiredOption("-s, --source-revision-sha <source-revision-sha/branch-name>", "source-revision-sha or the branch you want to branch out from", "master")
    .requiredOption("-n, --tag-name <tag-name>", "The tag number to be used")
    .action(function (targetRepo, options) {
        tagRemote(options.githubToken, targetRepo, options.sourceRevisionSha, options.tagName);
    });

program
    .command('*')
    .action(function (env) {
        console.log('Unrecognized command');
    });

program.parse(process.argv);
