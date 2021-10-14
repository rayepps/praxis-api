import {
  Pane,
  Heading,
  Text,
  majorScale,
  minorScale
} from 'evergreen-ui'
import Link from 'next/link'
import theme from 'src/theme'
import * as t from '../../types'
import styled from 'styled-components'


const StyledItem = styled(Pane)`
  &:hover {
    cursor: pointer;
  }
  .px-training-item-view {
    opacity: 0;
    transition: opacity .5s;
  }
  &:hover .px-training-item-view {
    opacity: 1;
  }
`

export default function TrainingList({
  trainings,
  orientation,
  oneRow = false
}: {
  trainings: t.Training[]
  orientation: 'vertical' | 'horizontal'
  oneRow?: boolean
}) {
  const columns = 4
  const items = oneRow
    ? trainings.slice(0, columns)
    : trainings
  return (
    <Pane
      display='grid'
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {items.map((training) => (
        <Link key={training.slug} href={`/training/${training.slug}`}>
          <StyledItem>
            <Pane
              backgroundImage={`url(${training.thumbnail?.url})`}
              backgroundSize='cover'
              backgroundPosition='center center'
              backgroundRepeat='no-repeat'
              height={300}
              borderRadius={4}
              position='relative'
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
                <Text fontWeight='bold'>{training.displayPrice}</Text>
              </Pane>
              <Pane
                backgroundColor='rgba(0, 0, 0, 0.8)'
                position='absolute'
                top={10}
                right={10}
                paddingX={minorScale(2)}
                paddingY={minorScale(1)}
                borderRadius={4}
                className='px-training-item-view'
              >
                <Text 
                  fontWeight='bold' 
                  color={theme.colors.white.hex()}
                >
                  View
                </Text>
              </Pane>
            </Pane>
            <Pane marginTop={majorScale(1)}>
              <Heading>{training.name}</Heading>
              <Text>{training.company.name}</Text>
            </Pane>
          </StyledItem>
        </Link>
      ))}
    </Pane>
  )
}