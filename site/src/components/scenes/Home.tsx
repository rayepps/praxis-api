import {
  Pane,
  Text,
  Heading,
  Paragraph,
  Link as EvergreenLink,
  minorScale,
  majorScale
} from 'evergreen-ui'
import Link from 'next/link'
import { Stack, Center, Split } from '../Layout'
import PraxisStar from '../svg/PraxisStar'
import TrainingList from '../ui/TrainingList'
import StatsBlocks from '../ui/StatsBlocks'
import LabeledImageList from '../ui/LabeledImageList'
import * as t from '../../types'
import theme from 'src/theme'


export default function HomeScene({
  popularTrainings,
  featuredTags
}: {
  popularTrainings: t.Training[]
  featuredTags: t.FeatureTag[]
}) {

  return (
    <>
      {/* HERO */}
      <Split minHeight='80vh' borderBottom={`1px solid ${theme.colors.lightGrey.hex()}`}>
        <Stack
          flex={1}
          paddingX={majorScale(4)}
          justifyContent='center'
        >
          <Pane>
            <Heading
              size={900}
            >
              This Is Where Theory <br />Meets Practice
            </Heading>
            <Paragraph
              maxWidth={400}
            >
              Its time to get out and get well trained. Put in the sweat and have the fun. We’ll bring you the best companies, courses, and events to choose from.
            </Paragraph>
          </Pane>
          <Pane marginTop={majorScale(3)}>
            <Link href="/search">
              <EvergreenLink
                backgroundColor={theme.colors.black.hex()}
                color={theme.colors.white.hex()}
                padding={minorScale(2)}
                marginRight={majorScale(2)}
              >
                Start Training
              </EvergreenLink>
            </Link>
            <EvergreenLink href="https://shop.praxisco.us">
              True Believer?
            </EvergreenLink>
          </Pane>
        </Stack>
        <Center flex={1}>
          <PraxisStar
            height={500}
          />
        </Center>
      </Split>

      {/* POPULAR TRAINNGS */}
      <Stack padding={majorScale(4)}>
        <Split>
          <Pane flex={1}>
            <Heading size={700}>Popular Trainings</Heading>
            <Paragraph maxWidth={400}>These are some of our most popular trainings from some our best companies. You can gaurntee they won't be easy, but they will be worth it.</Paragraph>
          </Pane>
          <Pane>
            <EvergreenLink href="/search">View All Trainings</EvergreenLink>
          </Pane>
        </Split>
        <TrainingList
          orientation='horizontal'
          trainings={popularTrainings}
          oneRow
        />
      </Stack>

      {/* STATS */}
      <Pane
        paddingY={majorScale(10)}
      >
        <StatsBlocks
          stats={[
            { value: 100, label: 'Trainings' },
            { value: 50, label: 'Companies' },
            { value: 20, label: 'States' },
            { value: 500, label: 'Events/Year' }
          ]}
        />
      </Pane>

      {/* FEATURED TAGS */}
      <Stack padding={majorScale(4)}>
        <Pane>
          <Heading size={700}>Advanced &amp; Unique</Heading>
          <Paragraph maxWidth={400}>
            These are some of our most popular trainings from some our best companies. You can gaurntee they won't be easy, but they will be worth it.
          </Paragraph>
        </Pane>
        <LabeledImageList
          items={featuredTags.map(ft => ({
            imageUrl: ft.thumbnail.url,
            label: ft.tag.name,
            link: `/featured-tag/${ft.tag.slug}`
          }))}
        />
      </Stack>
    </>
  )
}