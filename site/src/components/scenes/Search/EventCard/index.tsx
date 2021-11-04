import * as t from 'src/types'
import { Stack, Split } from 'src/components/Layout'
import formatDate from 'date-fns/format'
import theme from 'src/theme'
import {
  Pane,
  Text,
  Heading,
  Tooltip,
  minorScale,
  majorScale
} from 'evergreen-ui'
import styled from 'styled-components'
import { currentEventState } from 'src/state/search' 
import { useSetRecoilState } from 'recoil'


const StyledItem = styled(Pane)`
  &:hover {
    cursor: pointer;
  }
  .px-event-grid-item-view {
    opacity: 0;
    transition: opacity .5s;
  }
  &:hover .px-event-grid-item-view {
    opacity: 1;
  }
`

export default function EventCard({
  event
}: {
  event: t.Event
}) {

  const setCurrentEvent = useSetRecoilState(currentEventState)

  const start = event.startDate ? new Date(event.startDate) : null
  // const end = event.endDate ? new Date(event.endDate) : null

  const format = (date: Date | null) => {
    if (!date) return ''
    return formatDate(date, 'M.d.yyyy')
  }

  const handleClick = () => {
    setCurrentEvent(event.id)
  }

  return (
    <Stack onClick={handleClick}>
      <StyledItem
        backgroundImage={`url(${event.training.thumbnail?.url})`}
        width='100%'
        height={230}
        backgroundPosition='center center'
        backgroundRepeat='no-repeat'
        backgroundSize='cover'
        position='relative'
        borderRadius={4}
      >
        <Pane
          backgroundColor='rgba(255, 255, 255, 0.8)'
          position='absolute'
          top={10}
          left={10}
          paddingX={minorScale(2)}
          paddingY={minorScale(1)}
          borderRadius={4}
        >
          <Text fontWeight='bold'>{event.training.displayPrice}</Text>
        </Pane>
        <Pane
          backgroundColor='rgba(0, 0, 0, 0.8)'
          position='absolute'
          top={10}
          right={10}
          paddingX={minorScale(2)}
          paddingY={minorScale(1)}
          borderRadius={4}
          className='px-event-grid-item-view'
        >
          <Text
            fontWeight='bold'
            color={theme.colors.white.hex()}
          >
            View
          </Text>
        </Pane>
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
            borderRadius={3}
          />
        </Tooltip>
      </StyledItem>
      <Pane paddingTop={majorScale(1)}>
        <Split>
          <Text fontWeight='bold' color={theme.colors.green.hex()}>{format(start)}</Text>
          <Text marginX={minorScale(2)} color={theme.colors.yellow.hex()}>|</Text>
          <Text fontWeight='bold' color={theme.colors.green.hex()}>{event.city}, {event.state}</Text>
        </Split>
        <Heading size={600}>{event.training.name}</Heading>
      </Pane>
    </Stack>
  )
}