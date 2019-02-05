const Octokit = require('@octokit/rest');

class GitHub {
  constructor(token) {
    this.github = new Octokit({
      auth: `token ${token}`,
      previews: ['hellcat-preview'],
    });
  }

  createRepo(remote, params) {
    return new Promise((resolve, reject) => {
      this.github.repos
        .createInOrg({
          org: remote.origin.owner,
          name: remote.origin.name,
          description: params.description,
          team_id: params.team_id,
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  createIssue(remote, params = {}) {
    return new Promise((resolve, reject) => {
      this.github.issues
        .create({
          owner: remote.origin.owner,
          repo: remote.origin.name,
          title: params.title,
          body: params.body,
          labels: params.labels,
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
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

  /**
   * @returns team ID corresponding to the slug
   */
  async getTeamId(remote, teamSlug) {
    const {data} = await this.github.teams.list({org: remote.origin.owner});
    return data.find(team => team.slug === teamSlug).id;
  }

  /**
   * Create a new team given the params
   * @returns ID of the generated team
   */
  async createTeam(remote, params = {}) {
    const {data} = await this.github.teams.create({
      org: remote.origin.owner,
      name: params.name,
      description: params.description,
      privacy: params.privacy,
      maintainers: params.maintainers,
      repo_names: params.repo_names,
      parent_team_id: params.parent_team_id,
    });
    return data.id;
  }

  async addRepoToTeam(params = {}) {
    await this.github.teams.addOrUpdateRepo(params);
  }

  async addTeamMembers(team_id, members, role) {
    await Promise.all(
      members.map(async username => {
        await this.github.teams.addOrUpdateMembership({
          team_id,
          username,
          role,
        });
      }),
    );
  }
}

module.exports = GitHub;
