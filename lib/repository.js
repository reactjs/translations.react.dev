const shell = require('shelljs')
const Git = require('./git')
shell.config.silent = true

class Repository {
  constructor({ path = '.', remote, user }) {
    this.path = path
    this.remote = remote
    this.user = user
  }

  setup() {
    shell.cd(this.path)
    if (shell.cd(this.remote.origin.name).code !== 0) {
      Git.exec(`clone ${this.remote.origin.url} ${this.remote.origin.name}`)
      shell.cd(this.remote.origin.name)
      Git.exec(`remote add ${this.remote.upstream.name} ${this.remote.upstream.url}`)
      Git.exec(`remote add ${this.remote.head.name} ${this.remote.head.url}`)
      Git.exec(`config user.name "${this.user.name}"`)
      Git.exec(`config user.email "${this.user.email}"`)
    }
    this.resetChanges()
    this.checkputDefaultBranch()
    Git.exec('branch | grep -v "*" | xargs git branch -D')
  }

  fetchAllRemotes() {
    this.fetchUpstream()
    this.fetchHead()
  }

  updateLocal() {
    this.mergeUpstream()
  }

  fetchUpstream() {
    Git.fetch(this.remote.upstream.name, this.remote.upstream.defaultBranch)
  }

  mergeUpstream() {
    this.checkputDefaultBranch()
    Git.merge(`${this.remote.upstream.name}/${this.remote.upstream.defaultBranch}`)
    this.updateRemote(this.remote.origin.defaultBranch)
  }

  fetchHead() {
    Git.fetch(this.remote.head.name, this.remote.head.defaultBranch)
  }

  checkputDefaultBranch() {
    Git.checkout(this.remote.origin.defaultBranch)
  }

  updateRemote(branchName) {
    Git.push('origin', branchName)
  }

  resetChanges() {
    Git.exec('reset --hard')
  }

  existsRemoteBranch(branchName) {
    return Git.exec(`branch -a | grep -c remotes/origin/${branchName}`).stdout.replace('\n', '') === '1'
  }

  createNewBranch(branchName) {
    return Git.checkout(branchName, '-b')
  }

  hasConflicts(command, target, option) {
    if (command === 'cherry-pick') return Git.cherryPick(target, option).code !== 0
    else return Git.merge(target).code !== 0
  }
}

module.exports = Repository
