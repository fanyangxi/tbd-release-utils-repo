import BaseClient from './client-base';

export default class GithubClient extends BaseClient {
  isValidGithubRevisionSha(input) {
    return new RegExp('^\\b[0-9a-f]{40}\\b$', 'g').test(input);
  }

  async getRepoInfo(ghRepo) {
    try {
      return await ghRepo.infoAsync();
    } catch (err) {
      if (err.statusCode == 404) {
        throw new NotFoundError(
          'Cannot find repo, value should be in format (:owner/:repo) EG.: nodejs/node-gyp',
        );
      }

      throw new Error(
        `Failed to retrieve repo info. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }

  async getTree(ghRepo, revisionSha) {
    try {
      return await ghRepo.treeAsync(revisionSha);
    } catch (err) {
      throw new Error(
        `Failed to retrieve info with revision-sha, could be invalid sha: ${revisionSha}. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }

  async getBranch(ghRepo, branchName) {
    try {
      return await ghRepo.branchAsync(branchName);
    } catch (err) {
      if (err.statusCode == 404) {
        throw new NotFoundError(`Invalid branch-name: ${branchName}`);
      }

      throw new Error(
        `Failed to retrieve info with branch-name: ${branchName}. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }

  getCommit(ghRepo) {
    ghRepo.commit('b9c982332d960f43aba78ae68b5cb3809ab748f3', (err, data, headers) => {
      console.log(data);
    });
  }

  async createNewBranch(ghRepo, revisionSha, newBranchName) {
    try {
      return await ghRepo.createRefAsync(
        `refs/heads/${newBranchName}`,
        revisionSha,
      );
    } catch (err) {
      throw new Error(
        `Failed to create branch with name: ${newBranchName}. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }

  async deleteBranch(ghRepo, branchName) {
    try {
      return await ghRepo.deleteRefAsync(`heads/${branchName}`);
    } catch (err) {
      throw new Error(
        `Failed to delete branch: ${branchName}. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }

  async getRef(ghRepo, refName) {
    try {
      return await ghRepo.refAsync(refName);
    } catch (err) {
      if (err.statusCode == 404) {
        throw new NotFoundError(`Invalid reference-name: ${refName}`);
      }

      throw new Error(
        `Failed to retrieve info with reference-name: ${refName}. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }

  async getTag(ghRepo, tagName) {
    try {
      return await GithubClient.getRef(ghRepo, `tags/${tagName}`);
    } catch (err) {
      throw err;
    }
  }
  
  async createTag(ghRepo, revisionSha, tagName) {
    try {
      return await ghRepo.createRefAsync(`refs/tags/${tagName}`, revisionSha);
    } catch (err) {
      throw new Error(
        `Failed to create tag with name: ${tagName}. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }

  async deleteTag(ghRepo, tagName) {
    try {
      return await ghRepo.deleteRefAsync(`tags/${tagName}`);
    } catch (err) {
      throw new Error(
        `Failed to delete tag: ${tagName}. Detail: ${err.statusCode} - ${err.message}`,
      );
    }
  }
}
