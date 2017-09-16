const request = require('request-promise')

class Slack {
  constructor(options = {}) {
    this.token = options.token
    this.baseUrl = 'https://slack.com/api'
  }

  request(url, params) {
    let form = Object.assign({}, params, { token: this.token })
    return new Promise((resolve, reject) => {
      request.post(`${this.baseUrl}/${url}`, { form })
        .then(body => resolve(JSON.parse(body)))
        .catch(err => reject(err))
    })
  }

  authTest() {
    return this.request('auth.test', {})
  }

  getChannelHistory(params = {}) {
    return this.request('channels.history', params)
  }

  searchMessages(params = {}) {
    return this.request('search.messages', params)
  }

  addReactions(params = {}) {
    return this.request('reactions.add', params)
  }

  removeReactions(params = {}) {
    return this.request('reactions.remove', params)
  }
}

module.exports = Slack
