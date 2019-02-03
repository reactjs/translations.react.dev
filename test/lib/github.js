const assert = require('assert');
const GitHub = require('../../lib/github');

describe('Github', function() {
  const github = new GitHub();
  github.authenticate({
    type: 'token',
    token: process.env.GITHUB_TEST_ACCESS_TOKEN,
  });

  let remote = {
    origin: {
      owner: 'tesseralis',
    },
    upstream: {
      owner: 'tesseralis',
      name: 'test',
      defaultBranch: 'master',
    },
  };

  describe('issue', function() {
    let issueNumber;
    let hash = 'c0601c7981c0b6a53373cc70c2a1edb20908da68';
    let url = `https://github.com/vuejs-jp-bot/test/commit/${hash}`;

    describe('createIssue()', function() {
      it('creates new issue', async function() {
        const {data: newIssue} = await github.createIssue(remote, {
          title: 'Test',
          body: `Test\r\nOriginal:${url}`,
          labels: ['documentation'],
        });
        issueNumber = newIssue.number;
        assert(newIssue.state === 'open');
      });
    });

    describe('searchIssue()', function() {
      it('seaches issue', async function() {
        const {data: result} = await github.searchIssue(remote, {hash});
        assert(result.total_count >= 1);
      });
    });

    describe('closeIssue()', async function() {
      it('closes opened issue', async function() {
        const {data: closedIssue} = await github.closeIssue(remote, {
          number: issueNumber,
        });
        assert(closedIssue.state === 'closed');
      });
    });
  });

  describe('pullRequest', function() {
    let pullRequestNumber;

    describe('createPullRequest()', function() {
      it('creates new pull request', async function() {
        const {data: newPullRequest} = await github.createPullRequest(remote, {
          title: 'Test',
          body: 'Test',
          branch: 'new-branch',
        });
        pullRequestNumber = newPullRequest.number;
        assert(newPullRequest.state === 'open');
      });
    });

    describe('assignReviewers()', function() {
      it('assigns reviewer(s)', async function() {
        const {data: updatedPullRequest} = await github.assignReviewers(
          remote,
          {number: pullRequestNumber, reviewers: ['tesseralis']},
        );
        assert(updatedPullRequest.requested_reviewers.length === 1);
        assert(
          updatedPullRequest.requested_reviewers[0].login === 'tesseralis',
        );
      });
    });

    describe('closePullRequest()', async function() {
      it('closes opened pull request', async function() {
        const {data: closedPullRequest} = await github.closePullRequest(
          remote,
          {number: pullRequestNumber},
        );
        assert(closedPullRequest.state === 'closed');
      });
    });
  });
});
