import BaseClient from './client-base';

const Github = require('octonode');
const NotFoundError = require('../not-found-error');

export default class BitbucketClient extends BaseClient {
  constructor(githubToken, targetRepo) {
    super();
    this.client = Github.client(githubToken);
    this.ghRepo = this.client.repo(targetRepo);
  }

  // eslint-disable-next-line class-methods-use-this
  isValidRevisionSha(input) {
    return new RegExp('^\\b[0-9a-f]{40}\\b$', 'g').test(input);
  }

  async getRepoInfo() {
    try {
      return await this.ghRepo.infoAsync();
    } catch (err) {
      if (err.statusCode === 404) {
        throw new NotFoundError('Cannot find repo, value should be in format (:owner/:repo) EG.: nodejs/node-gyp');
      }

      throw new Error(`Failed to retrieve repo info. Detail: ${err.statusCode} - ${err.message}`);
    }
  }

  async getTree(revisionSha) {
    try {
      return await this.ghRepo.treeAsync(revisionSha);
    } catch (err) {
      throw new Error(`Failed to retrieve info with revision-sha, could be invalid sha: ${revisionSha}. Detail: ${err.statusCode} - ${err.message}`);
    }
  }

  async getBranch(branchName) {
    try {
      return await this.ghRepo.branchAsync(branchName);
    } catch (err) {
      if (err.statusCode === 404) {
        throw new NotFoundError(`Invalid branch-name: ${branchName}`);
      }

      throw new Error(`Failed to retrieve info with branch-name: ${branchName}. Detail: ${err.statusCode} - ${err.message}`);
    }
  }

  getCommit() {
    this.ghRepo.commit('b9c982332d960f43aba78ae68b5cb3809ab748f3',
      (err, data, headers) => {
        console.log(`${data} ${headers}`);
      });
  }

  async createNewBranch(revisionSha, newBranchName) {
    try {
      return await this.ghRepo.createRefAsync(
        `refs/heads/${newBranchName}`,
        revisionSha,
      );
    } catch (err) {
      throw new Error(`Failed to create branch with name: ${newBranchName}. Detail: ${err.statusCode} - ${err.message}`);
    }
  }

  async deleteBranch(branchName) {
    try {
      return await this.ghRepo.deleteRefAsync(`heads/${branchName}`);
    } catch (err) {
      throw new Error(`Failed to delete branch: ${branchName}. Detail: ${err.statusCode} - ${err.message}`);
    }
  }

  async getRef(refName) {
    try {
      return await this.ghRepo.refAsync(refName);
    } catch (err) {
      if (err.statusCode === 404) {
        throw new NotFoundError(`Invalid reference-name: ${refName}`);
      }

      throw new Error(`Failed to retrieve info with reference-name: ${refName}. Detail: ${err.statusCode} - ${err.message}`);
    }
  }

  async getTag(tagName) {
    return this.getRef(`tags/${tagName}`);
  }

  async createTag(revisionSha, tagName) {
    try {
      return await this.ghRepo.createRefAsync(`refs/tags/${tagName}`, revisionSha);
    } catch (err) {
      throw new Error(`Failed to create tag with name: ${tagName}. Detail: ${err.statusCode} - ${err.message}`);
    }
  }

  async deleteTag(tagName) {
    try {
      return await this.ghRepo.deleteRefAsync(`tags/${tagName}`);
    } catch (err) {
      throw new Error(`Failed to delete tag: ${tagName}. Detail: ${err.statusCode} - ${err.message}`);
    }
  }
}
