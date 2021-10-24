import {
  Pane,
  Text,
  majorScale,
  Link as EvergreenLink,
  minorScale
} from 'evergreen-ui'
import Breakpoint from 'src/components/ui/Breakpoint'
import Link from 'next/link'
import theme from 'src/theme'
import { Center } from 'src/components/Layout'
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
  const content = ({ height }: { height: number }) => (
    <>
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
    </>
  )
  return (
    <>
      <Breakpoint small down>
        <Pane
          display='grid'
          gridTemplateColumns={`repeat(1, 1fr)`}
          columnGap={majorScale(4)}
          rowGap={majorScale(4)}
          paddingTop={majorScale(4)}
          paddingBottom={majorScale(4)}
        >
          {content({
            height: 300
          })}
        </Pane>
      </Breakpoint>
      <Breakpoint medium up>
        <Pane
          display='grid'
          gridTemplateColumns={`repeat(2, 1fr)`}
          columnGap={majorScale(4)}
          rowGap={majorScale(4)}
          paddingTop={majorScale(4)}
          paddingBottom={majorScale(4)}
        >
          {content({
            height: 400
          })}
        </Pane>
      </Breakpoint>
    </>
  )
}