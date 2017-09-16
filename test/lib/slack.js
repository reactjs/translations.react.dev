const assert = require('assert')
const Slack = require('../../lib/slack')

describe('Slack', function () {
  const slack = new Slack({ token: process.env.SLACK_TEST_TOKEN })

  describe('authTest()', function () {
    it('checks authentication', async function () {
      const result = await slack.authTest()
      assert(result.ok)
    })
  })

  describe('getChannelHistory()', function () {
    it('returns history of messages', async function () {
      const result = await slack.getChannelHistory({ channel: process.env.SLACK_TEST_CHANNEL })
      assert(result.ok)
      assert(result.messages.length > 0)
    })
  })

  describe('searchMessages()', function () {
    it('returns messages matching a query', async function () {
      const result = await slack.searchMessages({ query: 'test' })
      assert(result.ok)
    })
  })


  describe('addReactions()', function () {
    it('adds a reaction', async function () {
      const { messages } = await slack.getChannelHistory({ channel: process.env.SLACK_TEST_CHANNEL })
      const result = await slack.addReactions({
        name: 'green_heart',
        channel: process.env.SLACK_TEST_CHANNEL,
        timestamp: messages[0].ts,
      })
      assert(result.ok)
    })
  })

  describe('removeReactions()', function () {
    it('removes a reaction', async function () {
      const { messages } = await slack.getChannelHistory({ channel: process.env.SLACK_TEST_CHANNEL })
      const result = await slack.removeReactions({
        name: 'green_heart',
        channel: process.env.SLACK_TEST_CHANNEL,
        timestamp: messages[0].ts,
      })
      assert(result.ok)
    })
  })
})
