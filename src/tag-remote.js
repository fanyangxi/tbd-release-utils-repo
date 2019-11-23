const Confirm = require('prompt-confirm');

async function tagRemote(vcsClient, source, tagName) {
  console.log(`Params: ${source} ${tagName}`);

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
    const theTag = await vcsClient.getTag(tagName);
    const isDestinationExist = !!theTag;
    if (isDestinationExist) {
      // if yes: confirm if delete existing destination
      const result = await new Confirm(`Warning: Target tag (${tagName}) already exist, do you want to delete and re-create it?`).run();
      if (!!result === true) {
        console.log(`Delete existing tag ${tagName}`);
        vcsClient.deleteTag(tagName);
      } else {
        console.log('Stop and exit');
        process.exit();
      }
    }

    // Proceed with actual branch-out:
    console.log(`Creating tag ${tagName} from ${baseRevisionSha}`);
    await vcsClient.createTag(baseRevisionSha, tagName);
    console.log('Tag-remote finished');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

module.exports = {
  tagRemote,
};
