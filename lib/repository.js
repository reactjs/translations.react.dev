const shell = require('shelljs');
const Git = require('./git');
const Utility = require('./utility');
shell.config.silent = true;

class Repository {
  constructor({path = '.', remote, user}) {
    this.path = path;
    this.remote = remote;
    this.user = user;
  }

  setup() {
    shell.cd(this.path);
    if (shell.cd(this.remote.origin.name).code !== 0) {
      Utility.log('I', `Cloning ${this.remote.origin.name}...`);
      Git.exec(`clone ${this.remote.origin.url} ${this.remote.origin.name}`);
      Utility.log('I', 'Finished cloning');
      shell.cd(this.remote.origin.name);
      Git.exec(
        `remote add ${this.remote.upstream.name} ${this.remote.upstream.url}`,
      );
      Git.exec(`remote add ${this.remote.head.name} ${this.remote.head.url}`);
      Git.exec(`config user.name "${this.user.name}"`);
      Git.exec(`config user.email "${this.user.email}"`);
      this.fetchUpstream();
      if (
        this.remote.origin.defaultBranch === this.remote.upstream.defaultBranch
      ) {
        this.createNewBranch('tmp');
        Git.exec(`branch -D ${this.remote.origin.defaultBranch}`);
      }
      this.createNewBranch(
        `${this.remote.upstream.defaultBranch} ${this.remote.upstream.name}/${
          this.remote.upstream.defaultBranch
        }`,
      );
    }
    this.resetChanges();
    this.checkoutDefaultBranch();
    Git.exec('branch | grep -v "*" | xargs git branch -D');
  }

  fetchAllRemotes() {
    this.fetchUpstream();
    this.fetchHead();
  }

  updateDefaultBranch() {
    this.checkoutDefaultBranch();
    this.mergeUpstream();
  }

  fetchUpstream() {
    Git.fetch(this.remote.upstream.name, this.remote.upstream.defaultBranch);
  }

  mergeUpstream() {
    Git.merge(
      `${this.remote.upstream.name}/${this.remote.upstream.defaultBranch}`,
    );
  }

  fetchHead() {
    Git.fetch(this.remote.head.name, this.remote.head.defaultBranch);
  }

  checkoutDefaultBranch() {
    Git.checkout(this.remote.upstream.defaultBranch);
  }

  updateRemote(branchName) {
    Git.push('origin', branchName);
  }

  resetChanges() {
    Git.exec('reset --hard');
  }

  existsCommit(hash) {
    return Git.exec(`cat-file commit ${hash}`).code === 0;
  }

  existsRemoteBranch(branchName) {
    return (
      Git.exec(
        `branch -a | grep -c remotes/origin/${branchName}`,
      ).stdout.replace('\n', '') === '1'
    );
  }

  deleteOldBranch(branchName) {
    return Git.exec(`branch -D ${branchName}`);
  }

  createNewBranch(branchName) {
    return Git.checkout(branchName, '-b');
  }

  hasConflicts(command, target, option) {
    if (command === 'cherry-pick')
      return Git.cherryPick(target, option).code !== 0;
    else return Git.merge(target).code !== 0;
  }
}

module.exports = Repository;
