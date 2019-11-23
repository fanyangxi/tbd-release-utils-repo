var Github = require('octonode');
var Confirm = require('prompt-confirm');
var NotFoundError = require('./not-found-error.js');
var { getBranch } = require('./shared.js');
import stuff from './repo-hosts/client-base';

const DEFAULT_SOURCE_BRANCH = "master";
const DEFAULT_DESTINATION_BRANCH = "release";

/*
source: could be the source-revision-number, or the branch-name
destinationBranch: the destination branch-name to be created
*/
async function branchOutRemote(githubToken, targetRepo, source, destinationBranch) {
    console.log(`${targetRepo} ${source} ${destinationBranch}`);
    const client = Github.client(githubToken);
    const ghRepo = client.repo(targetRepo);

    try {
        await _validateRepo(ghRepo);

        let baseRevisionSha = "";
        if(_isValidGithubRevisionSha(source)) {
            console.log(`Source received as revision-sha: ${source}`);
            const result = await getTree(ghRepo, source);
            console.log(`Revision-info: ${result[0]}`);
            baseRevisionSha = source;
        } else {
            console.log(`Source received as branch-name: ${source}`);
            //Try to get the head-commit-revision-number of branch
            const result = await getBranch(ghRepo, source);
            console.log(`Branch-latest-commit-info: ${result[0].commit.sha}`);
            baseRevisionSha = result[0].commit.sha;
        }

        // check if destination-branch exist
        const isDestinationExist = await _isBranchExist(ghRepo, destinationBranch);
        if (isDestinationExist) {
            //if yes: confirm if delete existing destination
            const result = await new Confirm(`Warning: Target branch (${destinationBranch}) already exist, do you want to delete and re-create it?`).run();
            if (!!result == true) {
                _deleteBranch(ghRepo, destinationBranch);
            } else {
                console.log("Stop and exit");
                process.exit();
            }
        }

        // Proceed with actual branch-out:
        console.log(`Creating branch ${destinationBranch} from ${baseRevisionSha}`);
        await _createNewBranch(ghRepo, baseRevisionSha, destinationBranch);
        console.log("Branch-out-remote finished");
    } catch(err) {
        console.log(`Error: ${err.message}`);
    }
}

function _isValidGithubRevisionSha(input) {
    return new RegExp("^\\b[0-9a-f]{40}\\b$", "g").test(input)
}

async function _validateRepo(ghRepo) {
    try {
        return await ghRepo.infoAsync();
    } catch(err) {
        if (err.statusCode == 404) {
            throw new NotFoundError(`Cannot find repo, value should be in format (:owner/:repo) EG.: nodejs/node-gyp`);
        }

        throw new Error(`Failed to retrieve repo info. Detail: ${err.statusCode} - ${err.message}`);
    }
}

async function getTree(ghRepo, revisionSha) {
    try {
        return await ghRepo.treeAsync(revisionSha);
    } catch(err) {
        throw new Error(`Failed to retrieve info with revision-sha, could be invalid sha: ${revisionSha}. Detail: ${err.statusCode} - ${err.message}`);
    }
}

function getCommit(ghRepo) {
    ghRepo.commit("b9c982332d960f43aba78ae68b5cb3809ab748f3", function(err, data, headers) {
        console.log(data);
    });
}

async function _isBranchExist(ghRepo, branchName) {
    try {
        const result = await getBranch(ghRepo, branchName);
        return !!result;
    } catch(err) {
        if (err instanceof NotFoundError) {
            return false
        }

        throw err;
    }
}

async function _createNewBranch(ghRepo, revisionSha, newBranchName) {
    try {
        return await ghRepo.createRefAsync(`refs/heads/${newBranchName}`, revisionSha);
    } catch(err) {
        throw new Error(`Failed to create branch with name: ${newBranchName}. Detail: ${err.statusCode} - ${err.message}`);
    }
}

async function _deleteBranch(ghRepo, branchName) {
    try {
        return await ghRepo.deleteRefAsync(`heads/${branchName}`);
    } catch(err) {
        throw new Error(`Failed to delete branch: ${branchName}. Detail: ${err.statusCode} - ${err.message}`);
    }
}

function _createTag(ghRepo, revisionSha, tagName) {
    ghRepo.createRef(`refs/tags/${tagName}`, revisionSha, function(err, data, headers) {
        console.log("error: " + err);
        console.log("data: " + JSON.stringify(data));
        console.log("headers:" + headers);
    });
}

function _deleteTag(ghRepo, tagName) {
    ghRepo.deleteRef(`tags/${tagName}`, function(err, data, headers) {
        console.log("error: " + err);
        console.log("data: " + JSON.stringify(data));
        console.log("headers:" + headers);
    });
}

module.exports = {
    branchOutRemote: branchOutRemote
};
