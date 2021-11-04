import { useEffect } from 'react'
import {
  Text,
  Heading,
  Pane,
  Link as EvergreenLink,
  Paragraph,
  minorScale,
  Button,
  majorScale
} from 'evergreen-ui'
import formatDate from 'date-fns/format'
import * as t from 'src/types'
import theme from 'src/theme'
import { Center, Split } from '../Layout'
import HorizontalGallery from 'src/components/ui/HorizontalGallery'
import { useFetch } from 'src/hooks'
import * as api from 'src/api'


export default function EventDetailScene({
  event,
  onClose
}: {
  event: t.Event
  onClose?: () => void
}) {

  const { training } = event

  const start = event.startDate ? new Date(event.startDate) : null
  // const end = event.endDate ? new Date(event.endDate) : null

  const format = (date: Date | null) => {
    if (!date) return ''
    return formatDate(date, 'M.d.yyyy')
  }

  return (
    <Pane>
      <Split alignItems='start' marginBottom={majorScale(2)}>
        <Pane flex={1}>
          <Heading size={800}>{training.name}</Heading>
          <Pane>
            <Text fontWeight='bold' color={theme.colors.green.hex()}>{event.city}, {event.state}</Text>
            <Text marginX={minorScale(2)} color={theme.colors.yellow.hex()}>|</Text>
            <Text fontWeight='bold' color={theme.colors.green.hex()}>{training.displayPrice}</Text>
            <Text marginX={minorScale(2)} color={theme.colors.yellow.hex()}>|</Text>
            <Text fontWeight='bold' color={theme.colors.green.hex()}>{format(start)}</Text>
          </Pane>
        </Pane>
        <EvergreenLink
          href={event.externalLink}
          padding={minorScale(2)}
          backgroundColor={theme.colors.black.hex()}
          style={{
            color: theme.colors.white.hex()
          }}
          marginRight={minorScale(2)}
        >
          sign up
        </EvergreenLink>
        <Button 
          appearance='minimal'
          onClick={onClose}
        >close</Button>
      </Split>
      <HorizontalGallery
        images={training.gallery.map(g => g.url)}
      />
      <Pane marginTop={majorScale(2)}>
        <div dangerouslySetInnerHTML={{ __html: training.description.html }} />
      </Pane>
    </Pane>
  )
}