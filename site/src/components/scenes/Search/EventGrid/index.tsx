import _ from 'radash'
import * as t from 'src/types'
import {
  majorScale,
  Pane
} from 'evergreen-ui'
import EventCard from '../EventCard'
import { useCurrentWidth } from 'react-socks'
import Skeleton from 'react-loading-skeleton'


export default function EventGrid({
  events,
  loading = false
}: {
  events: t.Event[]
  loading?: boolean
}) {
  const width = useCurrentWidth()
  const columns = Math.round(width / 500)
  return (
    <Pane
      flex={1}
      display='grid'
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {!loading && events.filter(x => !!x.slug).map(event => (
        <EventCard key={event.slug} event={event} />
      ))}
      {loading && [0, 1, 2, 3, 4].map((i) => (
        <Pane key={i}>
          <Pane marginBottom={8}>
            <Skeleton
              width='100%'
              height={170}
            />
          </Pane>
          <Pane marginBottom={8}>
            <Skeleton
              width='40%'
              height={24}
            />
          </Pane>
          <Pane>
            <Skeleton
              width='67%'
              height={24}
            />
          </Pane>
        </Pane>
      ))}
    </Pane>
  )
}