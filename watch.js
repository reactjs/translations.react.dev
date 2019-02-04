const fs = require('fs');
const RssFeedEmitter = require('rss-feed-emitter');
const Queue = require('queue');
const Github = require('./lib/github');
const Repo = require('./lib/repository');
const Utility = require('./lib/utility');
const config = require('./config.json');
const languages = require('./languages.json');

let headFeeder = new RssFeedEmitter();
let github = null;
let q = Queue({autostart: true, concurrency: 1});

const {owner, repository, feedRefresh} = config;
const [langCode] = process.argv.slice(2);

const langName = languages.find(lang => lang.code === langCode).name;
const repoName = `${langCode}.${repository}`;
const url = `https://github.com/${owner}/${repoName}.git`;
const defaultBranch = 'master';

let remote = {
  origin: {
    url,
    owner,
    name: repoName,
    defaultBranch,
  },
  // TODO figure out what this is needed for
  upstream: {
    url: url,
    owner,
    name: repoName,
    defaultBranch,
  },
  head: {
    url: `https://github.com/${owner}/${repository}.git`,
    name: repository,
    defaultBranch,
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

const setup = async () => {
  github = new Github(process.env.GITHUB_ACCESS_TOKEN);
  await setupRepositoryAndTeam();
  Utility.log('I', `${repoName} Setting up repo...`);
  repo.setup();
  Utility.log('I', `${repoName} Finished setting up`);
  // setupHeadFeeder();
};

const setupRepositoryAndTeam = async () => {
  const {data: result} = await github.searchRepo(remote);
  if (result.total_count > 0) return;

  console.log(`${repoName} creating new repo in GitHub...`);
  try {
    // FIXME why does this work???
    await github.createRepo(remote, {
      // TODO generalize this (maybe get from the head repo?)
      description: `(Work in progress) React documentation website in ${langName}`,
    });
    console.log('Repo succeeded');
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Repo happened I guess');
  }

  Utility.log('I', `${repoName} Setting up mirror repo...`);
  repo.setupMirror();
  Utility.log('I', `${repoName} Finished setting up mirror repo`);

  const body = fs.readFileSync('./PROGRESS.template.md');
  await github.createIssue(remote, {
    title: `${langName} Translation Progress`,
    body,
  });
  /**
   * * create team
   * * add maintainers
   */
};

const setupHeadFeeder = () => {
  headFeeder.add({
    url: `https://github.com/${owner}/${repository}/commits/${defaultBranch}.atom`,
    refresh: feedRefresh,
  });

  headFeeder.on('new-item', handleNewItem);
};

const handleNewItem = async item => {
  Utility.log('I', `${repoName} New commit on head repo: ${item.title}`);

  const hash = Utility.extractBasename(item.link);
  // branch names consisting of 40 hex characters are not allowed
  const shortHash = hash.substr(0, 8);

  if (repo.existsCommit(shortHash)) {
    Utility.log(
      'W',
      `${repoName} ${item.title}: Commit has already been merged`,
    );
    return;
  }

  if (repo.existsRemoteBranch(shortHash)) {
    Utility.log('W', `${repoName} ${item.title}: Remote branch already exists`);
    return;
  }

  const {data: result} = await github.searchIssue(remote, {hash});
  let issueNo = null;
  if (result.total_count === 0) {
    let body = `Update to original repo\nOriginal:${item.link}`;
    const {data: newIssue} = await github.createIssue(remote, {
      title: `[Merge]: ${Utility.removeHash(item.title)}`,
      body,
    });
    issueNo = newIssue.number;
    Utility.log(
      'S',
      `${repoName} ${item.title}: Issue created: ${newIssue.html_url}`,
    );
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
            `${repoName} ${
              item.title
            }: Conflicts occurred. Please make a pull request by yourself`,
          );
          repo.resetChanges();
        } else {
          Utility.log('S', `${repoName} ${item.title}: Pull request created`);
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
  Utility.log(
    'S',
    `${repoName} Created new pull request: ${pullRequest.html_url}`,
  );
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

setTimeout(setup);
