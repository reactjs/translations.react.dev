const shell = require('shelljs');
const Git = require('./git');
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
      if (
        Git.exec(`clone ${this.remote.origin.url} ${this.remote.origin.name}`)
          .code !== 0
      ) {
        console.log(`Error setting up ${this.remote.origin.name}`);
        return;
      }
      shell.cd(this.remote.origin.name);
      Git.exec(
        `remote add ${this.remote.origin.name} ${this.remote.origin.url}`,
      );
      Git.exec(`remote add ${this.remote.head.name} ${this.remote.head.url}`);
      Git.exec(`config user.name "${this.user.name}"`);
      Git.exec(`config user.email "${this.user.email}"`);
      this.fetchOrigin();
      if (
        this.remote.origin.defaultBranch === this.remote.origin.defaultBranch
      ) {
        this.createNewBranch('tmp');
        Git.exec(`branch -D ${this.remote.origin.defaultBranch}`);
      }
      this.createNewBranch(
        `${this.remote.origin.defaultBranch} ${this.remote.origin.name}/${
          this.remote.origin.defaultBranch
        }`,
      );
    }
    // this.resetChanges();
    this.checkoutDefaultBranch();
    Git.exec('branch | grep -v "*" | xargs git branch -D');
  }

  setupMirror() {
    shell.cd(this.path);
    console.log(
      Git.exec(`clone ${this.remote.head.url} ${this.remote.origin.name}`).code,
    );
    shell.cd(this.remote.origin.name);
    Git.exec(`remote set-url origin ${this.remote.origin.url}`);
    Git.exec(`push -u origin ${this.remote.origin.defaultBranch}`);
    shell.cd('../..');
    // FIXME doing "setup" after this will fail"
  }

  fetchAllRemotes() {
    this.fetchOrigin();
    this.fetchHead();
  }

  updateDefaultBranch() {
    this.checkoutDefaultBranch();
    this.mergeOrigin();
  }

  fetchOrigin() {
    Git.fetch(this.remote.origin.name, this.remote.origin.defaultBranch);
  }

  mergeOrigin() {
    Git.merge(`${this.remote.origin.name}/${this.remote.origin.defaultBranch}`);
  }

  fetchHead() {
    Git.fetch(this.remote.head.name, this.remote.head.defaultBranch);
  }

  checkoutDefaultBranch() {
    Git.checkout(this.remote.origin.defaultBranch);
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
