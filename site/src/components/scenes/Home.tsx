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
import Breakpoint from 'src/components/ui/Breakpoint'

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
      <Split
        minHeight='80vh'
        borderBottom={`1px solid ${theme.colors.lightGrey.hex()}`}
        paddingY={majorScale(4)}
      >
        <Stack
          flex={1}
          paddingX={majorScale(4)}
          justifyContent='center'
        >
          <Breakpoint small down>
            <Center flex={1}>
              <PraxisStar
                height={200}
              />
            </Center>
          </Breakpoint>
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
                style={{
                  color: theme.colors.white.hex()
                }}
                padding={minorScale(2)}
                marginRight={majorScale(2)}
              >
                Start Training
              </EvergreenLink>
            </Link>
            <EvergreenLink
              href="https://shop.praxisco.us"
              style={{
                color: theme.colors.black.hex()
              }}
            >
              True Believer?
            </EvergreenLink>
          </Pane>
        </Stack>
        <Breakpoint medium up>
          <Center flex={1}>
            <PraxisStar
              height={500}
            />
          </Center>
        </Breakpoint>
      </Split>

      {/* POPULAR TRAINNGS */}
      <Stack padding={majorScale(4)}>
        <Split>
          <Pane flex={1}>
            <Heading size={700}>Popular Trainings</Heading>
            <Paragraph maxWidth={400}>These are some of our most popular trainings from some our best companies. You can gaurntee they won't be easy, but they will be worth it.</Paragraph>
          </Pane>
          <Breakpoint medium up>
            <Pane>
              <EvergreenLink
                href="/search"
                style={{
                  color: theme.colors.black.hex()
                }}
              >
                View All Trainings
              </EvergreenLink>
            </Pane>
          </Breakpoint>
        </Split>
        <TrainingList
          orientation='horizontal'
          trainings={popularTrainings}
        />
        <Breakpoint small down>
          <EvergreenLink
            href="/search"
            backgroundColor={theme.colors.black.hex()}
            textAlign='center'
            padding={majorScale(1)}
            style={{
              color: theme.colors.white.hex()
            }}
          >
            View All Trainings
          </EvergreenLink>
        </Breakpoint>
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
          <Paragraph maxWidth={600}>
            These are not hunter safety, concealed carry permit, or firearm safety courses. You can find those anywhere. Praxis is about traiing for that moment when your mental, emotional, and physical abilities are the difference between failure and survival.
          </Paragraph>
        </Pane>
        <LabeledImageList
          items={featuredTags.map(ft => ({
            imageUrl: ft.thumbnail.url,
            label: ft.tag.name,
            link: `/tag/${ft.tag.slug}`
          }))}
        />
      </Stack>
    </>
  )
}