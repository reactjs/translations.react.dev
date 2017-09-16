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

  let params = {
    title: 'Pull request Test',
    body: 'pull request Test',
    branch: 'new-branch',
  }

  describe('createPullRequest()', function () {
    it('creates new pull request', async function () {
      const { data: newPullRequest } = await github.createPullRequest(remote, params)
      assert(newPullRequest.state === 'open')
      const { data: closedPullRequest } = await github.closePullRequest(remote, { number: newPullRequest.number })
      assert(closedPullRequest.state === 'closed')
    })
  })
})
