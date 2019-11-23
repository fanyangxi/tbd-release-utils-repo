import GithubClient from './repo-hosts/github-client';

const program = require('commander');
const { branchOutRemote } = require('./branch-out-remote');
const { tagRemote } = require('./tag-remote');

// Local(s):
const DEFAULT_SOURCE_BRANCH = 'master';
const DEFAULT_DESTINATION_BRANCH = 'release';


// Common setup for program:
program
  .option('-v, --verbose', 'output extra debugging');

// Command 1: af5c1f1815b65a34a21993adec7064f9ac2d9a9e
program
  .command('branch-out <target-repo>')
  .description('Create a release branch on remote repo. TARGET-REPO should be in format (:owner/:repo) EG.: nodejs/node-gyp')
  .requiredOption('-t, --github-token <github-token>', 'Your github token')
  .requiredOption('-s, --source-revision-sha <source-revision-sha/branch-name>', 'source-revision-sha or the branch you want to branch out from', DEFAULT_SOURCE_BRANCH)
  .requiredOption('-d, --destination-repo <destination-repo>', 'the destination-repo', DEFAULT_DESTINATION_BRANCH)
  .action((targetRepo, options) => {
    const vcsClient = new GithubClient(options.githubToken, targetRepo);
    branchOutRemote(vcsClient, options.sourceRevisionSha, options.destinationRepo);
  });

// Command 2:
program
  .command('tag <target-repo>')
  .description('Create a tag on remote repo.')
  .requiredOption('-t, --github-token <github-token>', 'Your github token')
  .requiredOption('-s, --source-revision-sha <source-revision-sha/branch-name>', 'source-revision-sha or the branch you want to branch out from', 'master')
  .requiredOption('-n, --tag-name <tag-name>', 'The tag number to be used')
  .action((targetRepo, options) => {
    process.env.mode = 'the-github';
    const vcsClient = new GithubClient(options.githubToken, targetRepo);
    tagRemote(vcsClient, options.sourceRevisionSha, options.tagName);
  });

program
  .command('*')
  .action(() => {
    console.log('Unrecognized command');
  });

program.parse(process.argv);
