import * as t from '../../types'
import {
  majorScale,
  Pane
} from 'evergreen-ui'
import EventCard from '../EventCard'

export default function EventGrid({
  events
}: {
  events: t.Event[]
}) {
  return (
    <Pane
      flex={1}
      display='grid'
      gridTemplateColumns='repeat(4, 1fr)'
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {events.filter(x => !!x.slug).map(event => (
        <EventCard key={event.slug} event={event} />
      ))}
    </Pane>
  )
}