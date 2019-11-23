import GithubClient from "./repo-hosts/github-client";

const Github = require("octonode");
const Confirm = require("prompt-confirm");
const NotFoundError = require("./not-found-error.js");

async function branchOutRemote(githubToken, targetRepo, source, destinationBranch) {
  console.log(`${targetRepo} ${source} ${destinationBranch}`);
  const client = Github.client(githubToken);
  const ghRepo = client.repo(targetRepo);

  try {
    // Validate the repo:
    await GithubClient.getRepoInfo(ghRepo);

    let baseRevisionSha = "";
    if (GithubClient.isValidGithubRevisionSha(source)) {
      console.log(`Source received as revision-sha: ${source}`);
      const result = await GithubClient.getTree(ghRepo, source);
      console.log(`Revision-info: ${result[0]}`);
      baseRevisionSha = source;
    } else {
      console.log(`Source received as branch-name: ${source}`);
      // Try to get the head-commit-revision-number of branch
      const result = await GithubClient.getBranch(ghRepo, source);
      console.log(`Branch-latest-commit-info: ${result[0].commit.sha}`);
      baseRevisionSha = result[0].commit.sha;
    }

    // check if destination-branch exist
    const theBranch = await GithubClient.getBranch(ghRepo, branchName);
    const isDestinationExist = !!theBranch;
    if (isDestinationExist) {
      // if yes: confirm if delete existing destination
      const result = await new Confirm(
        `Warning: Target branch (${destinationBranch}) already exist, do you want to delete and re-create it?`
      ).run();
      if (!!result == true) {
        GithubClient.deleteBranch(ghRepo, destinationBranch);
      } else {
        console.log("Stop and exit");
        process.exit();
      }
    }

    // Proceed with actual branch-out:
    console.log(`Creating branch ${destinationBranch} from ${baseRevisionSha}`);
    await GithubClient.createNewBranch(
      ghRepo,
      baseRevisionSha,
      destinationBranch
    );
    console.log("Branch-out-remote finished");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

module.exports = {
  branchOutRemote
};
