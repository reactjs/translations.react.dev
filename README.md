[![CircleCI](https://circleci.com/gh/re-fort/che-tsumi.svg?style=shield&circle-token=6e0d820d5783c1d12c06aa65afa447463f470467)](https://circleci.com/gh/re-fort/che-tsumi)

che-tsumi
======================

## Flow
1. Watch RSS feed(e.g. https://github.com/vuejs/vuejs.org/commits/master.atom)
1. Try to cherry-pick each commit when new feed items are detected
1. Create a new pull request if succeed
1. Add a reaction on Slack channel
