const assert = require('assert')
const Git = require('../../lib/git')

let SUCCESS = 0

describe('Git', function () {
  let currentBranch = Git.exec(`branch -a | grep '^*' | cut -b 3-`).stdout

  beforeEach(function () {
    Git.checkout(currentBranch, '')
  })

  describe('exec()', function () {
    it('returns 0 when succeed', function () {
      assert(Git.exec('status').code === SUCCESS)
    })
  })

  describe('checkout()', function () {
    let newBranch = new Date().getTime()

    it('returns 0 when succeed', function () {
      assert(Git.checkout(currentBranch, '').code === SUCCESS)
      assert(Git.checkout(newBranch, '-b').code === SUCCESS)
    })

    after(function () {
      Git.checkout(currentBranch, '')
      Git.exec(`branch -d ${newBranch}`)
    })
  })

  describe('fetch()', function () {
    it('returns 0 when succeed', function () {
      assert(Git.fetch('origin', 'master', '').code === SUCCESS)
      assert(Git.fetch('origin', 'master', '--dry-run').code === SUCCESS)
    })
  })

  describe('merge()', function () {
    it('returns 0 when succeed', function () {
      assert(Git.merge('master', '').code === SUCCESS)
      assert(Git.merge('origin/master', '').code === SUCCESS)
      assert(Git.merge('master', '--no-commit').code === SUCCESS)
    })
  })

  describe('cherryPick()', function () {
    it('returns 0 when succeed', function () {
      let latestHash = Git.exec('log --pretty=%H -n 1').stdout
      assert(Git.cherryPick(latestHash, '--no-commit').code === SUCCESS)
    })
  })
})
