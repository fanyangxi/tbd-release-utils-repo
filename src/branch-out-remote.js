const Confirm = require('prompt-confirm');

async function branchOutRemote(vcsClient, source, destinationBranch) {
  console.log(`Params: ${source} ${destinationBranch}`);

  try {
    // Validate the repo:
    await vcsClient.getRepoInfo();

    let baseRevisionSha = '';
    if (vcsClient.isValidRevisionSha(source)) {
      console.log(`Source at revision-sha: ${source}`);
      const result = await vcsClient.getTree(source);
      console.log(`Revision-info: ${result[0]}`);
      baseRevisionSha = source;
    } else {
      console.log(`Source at branch-name: ${source}`);
      // Try to get the head-commit-revision-number of branch
      const result = await vcsClient.getBranch(source);
      console.log(`Branch-latest-commit-info: ${result[0].commit.sha}`);
      baseRevisionSha = result[0].commit.sha;
    }

    // check if destination-branch exist
    const theBranch = await vcsClient.getBranch(destinationBranch);
    const isDestinationExist = !!theBranch;
    if (isDestinationExist) {
      // if yes: confirm if delete existing destination
      const result = await new Confirm(
        `Warning: Target branch (${destinationBranch}) already exist, do you want to delete and re-create it?`,
      ).run();
      console.log(result);
      if (!!result === true) {
        console.log(`Delete existing branch ${destinationBranch}`);
        vcsClient.deleteBranch(destinationBranch);
      } else {
        console.log('Stop and exit');
        process.exit();
      }
    }

    // Proceed with actual branch-out:
    console.log(`Creating branch ${destinationBranch} from ${baseRevisionSha}`);
    await vcsClient.createNewBranch(baseRevisionSha, destinationBranch);
    console.log('Branch-out-remote finished');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

module.exports = {
  branchOutRemote,
};
