import GithubClient from './repo-hosts/github-client';
import BitbucketClient from './repo-hosts/bitbucket-client';

const program = require('commander');
const { branchOutRemote } = require('./branch-out-remote');
const { tagRemote } = require('./tag-remote');

// Local(s):
const DEFAULT_SOURCE_BRANCH = 'master';
const DEFAULT_DESTINATION_BRANCH = 'release';


// Common setup for program:
program
  .option('-v, --verbose', 'output extra debugging');

// Command 1:
program
  .command('branch-out <target-repo>')
  .description('Create a release branch on remote repo. TARGET-REPO should be in format (:owner/:repo) EG.: nodejs/node-gyp')
  .requiredOption('-c, --vcs <vcs>', 'VCS type. EG.: Github, or Bitbucket')
  .requiredOption('-t, --github-token <github-token>', 'Your github token')
  .requiredOption('-s, --source-revision-sha <source-revision-sha/branch-name>', 'source-revision-sha or the branch you want to branch out from', DEFAULT_SOURCE_BRANCH)
  .requiredOption('-d, --destination-repo <destination-repo>', 'the destination-repo', DEFAULT_DESTINATION_BRANCH)
  .action((targetRepo, options) => {
    let vcsClient;
    if (options.vcs.toUpperCase() === 'GITHUB') {
      vcsClient = new GithubClient(options.githubToken, targetRepo);
    } else if (options.vcs.toUpperCase() === 'BITBUCKET') {
      vcsClient = new BitbucketClient(options.githubToken, targetRepo);
    } else {
      console.log(`Unrecognized VCS hosts-service type ${options.vcs}`);
      process.exit();
    }
    branchOutRemote(vcsClient, options.sourceRevisionSha, options.destinationRepo);
  });

// Command 2:
program
  .command('tag <target-repo>')
  .description('Create a tag on remote repo.')
  .requiredOption('-c, --vcs <vcs>', 'VCS type. EG.: Github, or Bitbucket')
  .requiredOption('-t, --github-token <github-token>', 'Your github token')
  .requiredOption('-s, --source-revision-sha <source-revision-sha/branch-name>', 'source-revision-sha or the branch you want to branch out from', 'master')
  .requiredOption('-n, --tag-name <tag-name>', 'The tag number to be used')
  .action((targetRepo, options) => {
    let vcsClient;
    if (options.vcs.toUpperCase() === 'GITHUB') {
      vcsClient = new GithubClient(options.githubToken, targetRepo);
    } else if (options.vcs.toUpperCase() === 'BITBUCKET') {
      vcsClient = new BitbucketClient(options.githubToken, targetRepo);
    } else {
      console.log(`Unrecognized VCS hosts-service type ${options.vcs}`);
      process.exit();
    }
    tagRemote(vcsClient, options.sourceRevisionSha, options.tagName);
  });

program
  .command('*')
  .action(() => {
    console.log('Unrecognized command');
  });

program.parse(process.argv);
