var NotFoundError = require('./not-found-error.js');

async function getBranch(ghRepo, branchName) {
    try {
        return await ghRepo.branchAsync(branchName);
    } catch(err) {
        if (err.statusCode == 404) {
            throw new NotFoundError(`Invalid branch-name: ${branchName}`);
        }

        throw new Error(`Failed to retrieve info with branch-name: ${branchName}. Detail: ${err.statusCode} - ${err.message}`, );
    }
}

module.exports = {
    getBranch: getBranch
}