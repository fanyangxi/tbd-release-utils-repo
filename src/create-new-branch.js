var github = require('octonode');

function getGithubClient() {
    return github.client("1c6ca59bd25541eff134d9a682daf276d19e287d");
}

function getBranches() {
    const client = getGithubClient();
    client.repo('fanyangxi/StringReplaceTask').branches(function(err, data, headers) {
        console.log(data);
    });
}

function createNewBranch() {
    const client = getGithubClient();
    client.repo('fanyangxi/StringReplaceTask').createRef("refs/release", "af5c1f1815b65a34a21993adec7064f9ac2d9a9e", function(err, data, headers) {
        console.log("error: " + err);
        console.log("data: " + JSON.stringify(data));
        console.log("headers:" + headers);
    });
}

module.exports = { createNewBranch: createNewBranch };