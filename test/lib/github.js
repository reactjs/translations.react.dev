const assert = require('assert')
const GitHub = require('../../lib/github')

describe('Github', function () {
  const github = new GitHub()
  github.authenticate({ type: 'token', token: process.env.GITHUB_TEST_ACCESS_TOKEN })

  let remote = {
    origin: {
      owner : 'vuejs-jp-bot',
    },
    upstream: {
      owner : 'vuejs-jp-bot',
      name: 'test',
      defaultBranch: 'master'
    },
  }

  describe('pullRequest', function () {
    let pullRequestNumber

    describe('createPullRequest()', function () {
      it('creates new pull request', async function () {
        const { data: newPullRequest } = await github.createPullRequest(remote, { title: 'Test', body: 'Test', branch: 'new-branch' })
        pullRequestNumber = newPullRequest.number
        assert(newPullRequest.state === 'open')
      })
    })

    describe('assignReviewers()', function () {
      it('assigns reviewer(s)', async function () {
        const { data: updatedPullRequest } = await github.assignReviewers(remote, { number: pullRequestNumber, reviewers: ['re-fort'] })
        assert(updatedPullRequest.requested_reviewers.length === 1)
        assert(updatedPullRequest.requested_reviewers[0].login === 're-fort')
      })
    })

    describe('closePullRequest()', async function () {
      it('closes opened pull request', async function () {
        const { data: closedPullRequest } = await github.closePullRequest(remote, { number: pullRequestNumber })
        assert(closedPullRequest.state === 'closed')
      })
    })
  })
})
