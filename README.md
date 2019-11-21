# tbd-release-utils:
A utils for `trunk-based development` release-management.  Includes `branch-out` (create a release on remote repo) and `tag` (tag a target revision on remote repo).


# Usage:
> tbd-release-utils branch-out -t `github-token` -s master -d release `target-repo`  
> tbd-release-utils tag -t `github-token` -s release -n `tag-name` `target-repo`


# Refers:
Libraries | GitHub Developer Guide
> https://developer.github.com/v3/libraries/

github api v3 in nodejs (Choose to use this package)
> https://github.com/pksunkara/OCTONODE

Command line node project sample:
> https://www.npmjs.com/package/commander
> https://github.com/motdotla/node-lambda
