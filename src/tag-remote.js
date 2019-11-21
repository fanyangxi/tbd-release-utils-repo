var Github = require('octonode');
var Confirm = require('prompt-confirm');
var NotFoundError = require('./not-found-error.js');
var { getBranch } = require('./shared.js');

const DEFAULT_SOURCE_BRANCH = "master";
const DEFAULT_DESTINATION_BRANCH = "release";

/*
source: could be the source-revision-number, or the branch-name
tagName: the result tag name
*/
async function tagRemote(githubToken, targetRepo, source, tagName) {
    console.log(`${targetRepo} ${source} ${tagName}`);
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
        const isDestinationExist = await _isTagExist(ghRepo, tagName);
        if (isDestinationExist) {
            //if yes: confirm if delete existing destination
            const result = await new Confirm(`Warning: Target tag (${tagName}) already exist, do you want to delete and re-create it?`).run();
            if (!!result == true) {
                _deleteTag(ghRepo, tagName);
            } else {
                console.log("Stop and exit");
                process.exit();
            }
        }

        // Proceed with actual branch-out:
        console.log(`Creating tag ${tagName} from ${baseRevisionSha}`);
        await _createTag(ghRepo, baseRevisionSha, tagName);
        console.log("Tag-remote finished");
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

async function _isTagExist(ghRepo, tagName) {
    try {
        const result = await getRef(ghRepo, `tags/${tagName}`);
        return !!result;
    } catch(err) {
        if (err instanceof NotFoundError) {
            return false
        }

        throw err;
    }
}

async function getRef(ghRepo, refName) {
    try {
        return await ghRepo.refAsync(refName);
    } catch(err) {
        if (err.statusCode == 404) {
            throw new NotFoundError(`Invalid reference-name: ${refName}`);
        }

        throw new Error(`Failed to retrieve info with reference-name: ${refName}. Detail: ${err.statusCode} - ${err.message}`, );
    }
}

async function _createTag(ghRepo, revisionSha, tagName) {
    try {
        return await ghRepo.createRefAsync(`refs/tags/${tagName}`, revisionSha);
    } catch(err) {
        throw new Error(`Failed to create tag with name: ${tagName}. Detail: ${err.statusCode} - ${err.message}`);
    }
}

async function _deleteTag(ghRepo, tagName) {
    try {
        return await ghRepo.deleteRefAsync(`tags/${tagName}`);
    } catch(err) {
        throw new Error(`Failed to delete tag: ${tagName}. Detail: ${err.statusCode} - ${err.message}`);
    }
}

module.exports = {
    tagRemote: tagRemote
};
