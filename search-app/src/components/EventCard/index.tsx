import * as t from '../../types'
import { Stack } from '../Layout'
import formatDate from 'date-fns/format'
import { Split } from '../Layout'
import theme from '../../theme'
import {
  Pane,
  Text,
  Heading,
  Tooltip,
  minorScale,
  majorScale
} from 'evergreen-ui'

export default function EventCard({
  event
}: {
  event: t.Event
}) {

  const start = event.startDate ? new Date(event.startDate) : null
  // const end = event.endDate ? new Date(event.endDate) : null

  const format = (date: Date | null) => {
    if (!date) return ''
    return formatDate(date, 'M.d.yyyy')
  }

  return (
    <Stack>
      <Pane
        backgroundImage={`url(${event.training.thumbnail?.url})`}
        width='100%'
        height={230}
        backgroundPosition='center center'
        backgroundRepeat='no-repeat'
        backgroundSize='cover'
        position='relative'
        borderRadius={4}
      >
        <Tooltip content={event.training.company?.name}>
          <Pane
            backgroundImage={`url(${event.training.company?.thumbnail?.url})`}
            width={40}
            height={40}
            backgroundPosition='center center'
            backgroundRepeat='no-repeat'
            backgroundSize='cover'
            position='absolute'
            bottom={10}
            right={10}
          />
        </Tooltip>
      </Pane>
      <Pane paddingTop={majorScale(1)}>
        <Split>
          <Text fontWeight='bold' color={theme.colors.green}>{format(start)}</Text>
          <Text marginX={minorScale(2)} color={theme.colors.yellow}>|</Text>
          <Text fontWeight='bold' color={theme.colors.green}>{event.city}, {event.state}</Text>
        </Split>
        <Heading size={600}>{event.training.name}</Heading>
      </Pane>
    </Stack>
  )
}