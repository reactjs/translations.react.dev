const shell = require('shelljs')
shell.config.silent = true

class Git {
  constructor() {
  }

  static exec(command, execOptions) {
    return shell.exec(`git ${command}`, execOptions)
  }

  static checkout(branch, option = '', execOptions) {
    return this.exec(`checkout ${option} ${branch}`, execOptions)
  }

  static fetch(repo, branch, option = '', execOptions) {
    return this.exec(`fetch ${option} ${repo} ${branch}`, execOptions)
  }

  static merge(branch, option = '', execOptions) {
    return this.exec(`merge ${option} ${branch}`, execOptions)
  }

  static push(repo, branch, option = '', execOptions) {
    return this.exec(`push ${option} ${repo} ${branch}`, execOptions)
  }

  static cherryPick(hash, option = '', execOptions) {
    return this.exec(`cherry-pick ${option} ${hash}`, execOptions)
  }
}

module.exports = Git
