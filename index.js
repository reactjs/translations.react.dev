const RssFeedEmitter = require('rss-feed-emitter');
const Queue = require('queue');
const Github = require('./lib/github');
const Repo = require('./lib/repository');
const Utility = require('./lib/utility');
const config = require('./config.json');

let headFeeder = new RssFeedEmitter();
let github = new Github();
let q = Queue({autostart: true, concurrency: 1});

let remote = {
  origin: {
    url: config.origin.url,
    owner: Utility.extractRepoOwner(config.origin.url),
    name: Utility.extractRepoName(config.origin.url),
    defaultBranch: config.origin.defaultBranch,
  },
  // TODO figure out what this is needed for
  upstream: {
    url: config.origin.url,
    owner: Utility.extractRepoOwner(config.origin.url),
    name: Utility.extractRepoName(config.origin.url),
    defaultBranch: config.origin.defaultBranch,
  },
  head: {
    url: config.head.url,
    name: Utility.extractRepoName(config.head.url),
    defaultBranch: config.head.defaultBranch,
  },
};

let repo = new Repo({
  path: 'repo',
  remote,
  user: {
    name: process.env.USER_NAME,
    email: process.env.EMAIL,
  },
});

const setup = () => {
  repo.setup();
  github.authenticate({
    type: 'token',
    token: process.env.GITHUB_ACCESS_TOKEN,
  });
  setupHeadFeeder();
};

const setupHeadFeeder = () => {
  headFeeder.add({
    url: process.env.HEAD_FEED_URL,
    refresh: Number(process.env.HEAD_FEED_REFRESH),
  });

  headFeeder.on('new-item', async item => {
    Utility.log('I', `New commit on head repo: ${item.title}`);

    const hash = Utility.extractBasename(item.link);
    // branch names consisting of 40 hex characters are not allowed
    const shortHash = hash.substr(0, 8);

    if (repo.existsCommit(shortHash)) {
      Utility.log('W', `${item.title}: Commit already exists in git logs`);
      return;
    }

    if (repo.existsRemoteBranch(shortHash)) {
      Utility.log('W', `${item.title}: Remote branch already exists`);
      return;
    }

    const {data: result} = await github.searchIssue(remote, {hash});
    let issueNo = null;
    if (result.total_count === 0) {
      let body = `Update to original repo\nOriginal:${item.link}`;
      const {data: newIssue} = await github.createIssue(remote, {
        title: `[Doc]: ${Utility.removeHash(item.title)}`,
        body,
      });
      issueNo = newIssue.number;
      Utility.log('S', `${item.title}: Issue created: ${newIssue.html_url}`);
    } else {
      issueNo = result.items[0].number;
    }

    q.push(() => {
      return new Promise(async (resolve, reject) => {
        try {
          q.stop();

          repo.fetchAllRemotes();
          repo.updateDefaultBranch();
          repo.deleteOldBranch(shortHash);
          repo.createNewBranch(shortHash);

          if (repo.hasConflicts('cherry-pick', hash)) {
            Utility.log(
              'W',
              `${
                item.title
              }: Conflicts occurred. Please make a pull request by yourself`,
            );
            repo.resetChanges();
          } else {
            Utility.log('S', `${item.title}: Pull request created`);
            repo.updateRemote(shortHash);
            await after(item, shortHash, issueNo);
          }

          resolve();
        } catch (e) {
          reject();
        } finally {
          q.start();
        }
      });
    });
  });
};

const after = async (item, shortHash, issueNo = null) => {
  const body = issueNo
    ? `This PR resolves #${issueNo}\r\nCherry picked from ${item.link}`
    : `Cherry picked from ${item.link}`;
  const {data: pullRequest} = await github.createPullRequest(remote, {
    title: Utility.removeHash(item.title),
    body,
    branch: shortHash,
  });
  if (!pullRequest) return;
  Utility.log('S', `Created new pull request: ${pullRequest.html_url}`);
  // TODO we probably want this back
  // await github.assignReviewers(remote, {
  //   number: pullRequest.number,
  //   reviewers: ["tesseralis"]
  // });
  // Utility.log("S", "Assigned reviewers");
};

process.on('unhandledRejection', err => {
  Utility.log('E', err);
});

setup();
