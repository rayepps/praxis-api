import { WebClient } from '@slack/web-api'
import config from './config'


export class SlackClient {
  constructor(private slack: WebClient) { }
  async sendMessage(message: string) {
    await this.slack.chat.postMessage({
      text: message,
      mrkdwn: true,
      unfurl_links: true,
      unfurl_media: true,
      channel: 'praxis-contacts',
    })
  }
}

const makeSlack = () => {
  return new SlackClient(new WebClient(config.slackOauthToken))
}

export default makeSlack