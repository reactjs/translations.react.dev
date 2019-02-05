const assert = require('assert');
const shell = require('shelljs');
const Repo = require('../../lib/repository');

describe('Repository', function() {
  let origin = {
    owner: 'teseralis-fan-club',
    name: 'doge.tesseralis.club',
  };

  const repo = new Repo({
    path: 'repo_test',
    remote: {
      origin: origin,
      upstream: Object.assign({}, origin, {name: 'upstream'}),
      head: Object.assign({}, origin, {name: 'head'}),
    },
    user: {
      name: process.env.USER_NAME,
      email: process.env.EMAIL,
    },
  });

  let currentPath = shell.pwd();

  after(function() {
    shell.cd(currentPath);
    shell.rm('-rf', repo.path);
  });

  describe('setup()', function() {
    it(`sets remote repositories and user's info`, function() {
      shell.mkdir(repo.path);
      repo.setup();
      assert(
        shell
          .exec(
            `git remote show -n ${
              repo.remote.upstream.name
            } | grep '^*' | cut -b 10-`,
          )
          .stdout.replace('\n', '') === repo.remote.upstream.name,
      );
      assert(
        shell
          .exec(
            `git remote show -n ${
              repo.remote.head.name
            } | grep '^*' | cut -b 10-`,
          )
          .stdout.replace('\n', '') === repo.remote.head.name,
      );
      assert(
        shell.exec('git config user.name').stdout.replace('\n', '') ===
          repo.user.name,
      );
      assert(
        shell.exec('git config user.email').stdout.replace('\n', '') ===
          repo.user.email,
      );
    });
  });

  describe('existsRemoteBranch()', function() {
    it('returns true/false whether remote branch exists', function() {
      let newBranch = new Date().getTime();

      assert(repo.existsRemoteBranch(repo.remote.origin.defaultBranch));
      assert.ifError(repo.existsRemoteBranch(newBranch));
    });
  });

  describe('hasConflicts()', function() {
    it('returns true/false whether cherry-pick/merge succeed', function() {
      let latestHash = shell.exec('git log --pretty=%H -n 1').stdout;

      assert.ifError(
        repo.hasConflicts('cherry-pick', latestHash, '--no-commit'),
      );
      assert.ifError(
        repo.hasConflicts(
          'merge',
          repo.remote.origin.defaultBranch,
          '--no-commit',
        ),
      );
    });
  });
});
