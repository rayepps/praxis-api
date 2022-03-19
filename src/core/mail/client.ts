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
    await postmark.sendEmailBatchWithTemplates(
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
  }
})

export type MailClient = ReturnType<typeof createPostmarkClient>

export default createPostmarkClient
