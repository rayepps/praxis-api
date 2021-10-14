import {
  Pane,
  Heading,
  Text,
  Link as EvergreenLink,
  Image,
  majorScale
} from 'evergreen-ui'
import Link from 'next/link'
import { Split, Center } from '../Layout'
import * as t from 'src/types'
import { useBreakpoint } from 'src/hooks'
import theme from 'src/theme'


export default function TrainingScene({
  training
}: {
  training: t.Training
}) {
  const breakpoint = useBreakpoint()
  return (
    <>
      <Split padding={majorScale(4)}>
        <Split flex={1} alignItems='center'>
          <Image height={50} src={training.company.thumbnail.url} />
          <Pane marginLeft={majorScale(2)}>
            <Heading>{training.name}</Heading>
            <Text>by {training.company.name}</Text>
          </Pane>
        </Split>
        <Pane>
          <Link href={training.externalLink ?? training.directLink ?? '/'}>
            <EvergreenLink
              style={{
                color: theme.colors.black.hex()
              }}
            >view at {training.company.name}</EvergreenLink>
          </Link>
        </Pane>
      </Split>
      <Split padding={majorScale(4)}>
        <Pane
          flex={1}
          maxWidth={500}
          minWidth={300}
          display='flex'
          flexDirection='column'
        >
          {training.gallery.map(asset => (
            <Image
              key={asset.url}
              src={asset.url}
              borderRadius={4}
              marginBottom={majorScale(2)}
            />
          ))}
        </Pane>
        {training.description?.html && breakpoint.showAt('medium', 'up') && (
          <Pane
            flex={1}
            marginLeft={majorScale(4)}
            maxWidth={600}
          >
            <div dangerouslySetInnerHTML={{ __html: training.description.html }} />
          </Pane>
        )}
      </Split>
      {training.description?.html && breakpoint.showAt('small', 'down') && (
        <Pane marginBottom={majorScale(4)}>
          <Pane
            padding={majorScale(4)}
            maxWidth={600}
          >
            <div dangerouslySetInnerHTML={{ __html: training.description.html }} />
          </Pane>
          <Center>
            <Link href={training.externalLink ?? training.directLink ?? '/'}>
              <EvergreenLink
                backgroundColor={theme.colors.black.hex()}
                padding={majorScale(2)}
                style={{
                  color: theme.colors.white.hex()
                }}
              >Sign Up at {training.company.name}</EvergreenLink>
            </Link>
          </Center>
        </Pane>
      )}
    </>
  )
}