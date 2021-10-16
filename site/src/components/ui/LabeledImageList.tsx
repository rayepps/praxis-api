import {
  Pane,
  Text,
  majorScale,
  Link as EvergreenLink,
  minorScale
} from 'evergreen-ui'
import Link from 'next/link'
import theme from 'src/theme'
import { Center } from 'src/components/Layout'
import { useBreakpoint } from 'src/hooks'
import styled from 'styled-components'


interface LabeledImage {
  imageUrl: string
  label: string
  link: string
}

const StyledPane = styled(Pane)`
  &:hover .px-tag-label-on-hover {
    opacity: 1;
  }
`

export default function LabeledImageList({
  items
}: {
  items: LabeledImage[]
}) {
  const breakpoint = useBreakpoint()
  const columns = breakpoint.select({
    'xsmall': 1
  }, 2)
  const height = breakpoint.select({
    'xsmall': 300,
    'small': 300,
    'medium': 350,
    'large': 450
  }, 500)
  return (
    <Pane
      display='grid'
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {items.map((item) => (
        <Link key={item.link} href={item.link} passHref>
          <EvergreenLink>
            <StyledPane
              backgroundImage={`url(${item.imageUrl})`}
              backgroundSize='cover'
              backgroundPosition='center center'
              height={height}
              borderRadius={4}
              display='flex'
              justifyContent='center'
              alignItems='center'
              position='relative'
            >
              <Pane
                position='absolute'
                backgroundColor={theme.colors.black.hex()}
                top={10}
                right={10}
                padding={minorScale(2)}
                borderRadius={4}
                opacity={0}
                transition='opacity .5s'
                className='px-tag-label-on-hover'
              >
                <Text color={theme.colors.white.hex()}>View {item.label} Trainings</Text>
              </Pane>
              <Center
                backgroundColor={theme.colors.green.alpha(0.5).rgb().string()}
                borderRadius='50%'
                height={100}
                width={100}
              >
                <Text
                  display='block'
                  color={theme.colors.white.hex()}
                  size={400}
                  fontWeight='bolder'
                >
                  {item.label}
                </Text>
              </Center>
            </StyledPane>
          </EvergreenLink>
        </Link>
      ))}
    </Pane>
  )
}