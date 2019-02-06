const Octokit = require('@octokit/rest');

class GitHub {
  constructor(token) {
    this.github = new Octokit({
      auth: `token ${token}`,
      previews: ['hellcat-preview'],
    });
  }

  /**
   * Creates a new issue and returns the new issue data
   */
  async createIssue(remote, params = {}) {
    const {data: newIssue} = this.github.issues.create({
      owner: remote.origin.owner,
      repo: remote.origin.name,
      title: params.title,
      body: params.body,
      labels: params.labels,
    });
    return newIssue;
  }

  closeIssue(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.issues
        .edit({
          owner: remote.origin.owner,
          repo: remote.origin.name,
          number: params.number,
          state: 'closed',
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  searchRepo(remote) {
    return new Promise((resolve, reject) => {
      this.github.search
        .repos({
          q: `${remote.origin.owner}/${remote.origin.name}`,
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  searchIssue(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.search
        .issues({
          q: `${params.hash} repo:${remote.origin.owner}/${
            remote.origin.name
          } type:issue`,
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  createPullRequest(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.pullRequests
        .create({
          owner: remote.origin.owner,
          repo: remote.origin.name,
          title: params.title,
          body: params.body,
          head: `${remote.origin.owner}:${params.branch}`,
          base: remote.origin.defaultBranch,
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  closePullRequest(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.pullRequests
        .update({
          owner: remote.origin.owner,
          repo: remote.origin.name,
          number: params.number,
          state: 'closed',
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  assignReviewers(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.pullRequests
        .createReviewRequest({
          owner: remote.origin.owner,
          repo: remote.origin.name,
          number: params.number,
          reviewers: params.reviewers,
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
}

module.exports = GitHub;
