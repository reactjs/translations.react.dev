const RssFeedEmitter = require('rss-feed-emitter')
const Github = require('./lib/github')
const Repo = require('./lib/repository')
// const Slack = require('./lib/slack')
const Utility = require('./lib/utility')

let upstreamFeeder = new RssFeedEmitter()
let headFeeder = new RssFeedEmitter()
let github = new Github()
// let slack = new Slack({ token: process.env.SLACK_TOKEN })

let startUpTime = new Date().toISOString()

let remote = {
  origin: {
    url: process.env.ORIGIN_REPO_URL,
    owner: Utility.extractRepoOwner(process.env.ORIGIN_REPO_URL),
    name: Utility.extractRepoName(process.env.ORIGIN_REPO_URL),
    defaultBranch: process.env.ORIGIN_REPO_DEFAULT_BRANCH,
  },
  upstream: {
    url: process.env.UPSTREAM_REPO_URL,
    owner: Utility.extractRepoOwner(process.env.UPSTREAM_REPO_URL),
    name: Utility.extractRepoName(process.env.UPSTREAM_REPO_URL),
    defaultBranch: process.env.UPSTREAM_REPO_DEFAULT_BRANCH,
  },
  head: {
    url: process.env.HEAD_REPO_URL,
    name: Utility.extractRepoName(process.env.HEAD_REPO_URL),
    defaultBranch: process.env.HEAD_REPO_DEFAULT_BRANCH,
  },
}

let repo = new Repo(
  {
    path: 'repo',
    remote,
    user: {
      name: process.env.USER_NAME,
      email: process.env.EMAIL,
    },
  }
)

const setup = () => {
  repo.setup()
  github.authenticate({ type: 'token', token: process.env.GITHUB_ACCESS_TOKEN })
  setupUpstreamFeeder()
  setupHeadFeeder()
}

const setupHeadFeeder = () => {
  headFeeder.add({
    url: process.env.HEAD_FEED_URL,
    refresh: Number(process.env.HEAD_FEED_REFRESH),
  })

  headFeeder.on('new-item', async function() {
    if (headFeeder.list()[0].items.length < Number(process.env.HEAD_FEED_ITEMS_LENGTH)) return
    for (const item of headFeeder.list()[0].items) {
      Utility.log('I', `New commit on head repo: ${item.title}`)
      let hash = Utility.extractBasename(item.link)
      // branch names consisting of 40 hex characters are not allowed
      let shortHash = hash.substr(0, 8)
      const { data: result } = await github.searchIssue(remote, { hash })

      let issueNo = null
      if (result.total_count === 0) {
        let body = `本家のドキュメントに更新がありました:page_facing_up:\r\nOriginal:${item.link}`
        const { data: newIssue } = await github.createIssue(remote, { title: `[Doc]: ${Utility.removeHash(item.title)}`, body, labels: ['documentation'] })
        issueNo = newIssue.number
        Utility.log('S', `Issue created: ${newIssue.html_url}`)
      } else {
        issueNo = result.items[0].number
      }

      if (repo.existsRemoteBranch(shortHash)) {
        Utility.log('W', `Remote branch already exists: ${shortHash}`)
        continue
      }

      repo.fetchAllRemotes()
      repo.updateDefaultBranch()
      repo.createNewBranch(shortHash)

      if (repo.hasConflicts('cherry-pick', hash)) {
        Utility.log('W', 'Conflicts occurred. Please make a pull request by yourself')
        repo.resetChanges()
      } else {
        Utility.log('S', `Fully merged: ${shortHash}`)
        repo.updateRemote(shortHash)
        await after(item, shortHash, issueNo)
      }
    }
  })
}

const setupUpstreamFeeder = () => {
  upstreamFeeder.add({
    url: process.env.UPSTREAM_FEED_URL,
    refresh: Number(process.env.UPSTREAM_FEED_REFRESH),
  })

  upstreamFeeder.on('new-item', function(item) {
    if (startUpTime < item.date.toISOString()) {
      Utility.log('I', `New commit on upstream repo: ${item.title}`)
      removeHeadFeeder()
      setupHeadFeeder()
    }
  })
}

const removeHeadFeeder = () => {
  headFeeder.off('new-item')
  headFeeder.destroy()
}

const after = async (item, shortHash, issueNo = null) => {
  const body = issueNo ? `This PR resolves #${issueNo}\r\nCherry picked from ${item.link}` : `Cherry picked from ${item.link}`
  const { data: pullRequest } = await github.createPullRequest(remote, { title: Utility.removeHash(item.title), body, branch: shortHash })
  if (!pullRequest) return
  Utility.log('S', `Created new pull request: ${pullRequest.html_url}`)
  await github.assignReviewers(remote, { number: pullRequest.number, reviewers: ['re-fort', 'kazupon'] })
  Utility.log('S', 'Assigned reviewers')
}

process.on('unhandledRejection', err => { Utility.log('E', err) })

setup()
