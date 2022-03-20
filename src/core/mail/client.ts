import _ from 'radash'
import { ServerClient, Models } from 'postmark'

type Template = 'new-events-added-notification'
type Sender = 'operator@praxisco.us' | 'ray@praxisco.us'
type Stream = 'transaction' | 'broadcast'

const createPostmarkClient = (postmark: ServerClient) => ({
  broadcast: async ({
    from,
    template: alias,
    messages
  }: {
    from: Sender
    template: Template
    messages: {
      to: string
      model: any
    }[]
  }) => {
    const stream: Stream = 'broadcast'
    const response = await postmark.sendEmailBatchWithTemplates(
      messages.map(msg => ({
        TemplateAlias: alias,
        From: from,
        TemplateModel: msg.model,
        To: msg.to,
        MessageStream: stream,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
        TrackOpens: true
      }))
    )
    if (response?.length > 0 && !!response[0].ErrorCode) {
      throw response[0]
    }
  }
})

export type MailClient = ReturnType<typeof createPostmarkClient>

export default createPostmarkClient
