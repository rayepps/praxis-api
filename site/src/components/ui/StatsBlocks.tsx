import {
  majorScale,
  Pane,
  Text
} from 'evergreen-ui'
import { useBreakpoint } from 'src/hooks'


interface Stat {
  value: number
  label: string
}

export default function StatsBlocks({
  stats
}: {
  stats: Stat[]
}) {
  const breakpoint = useBreakpoint()
  const columns = breakpoint.select({
    'xsmall': 1,
    'small': 2,
    'medium': 4
  }, 4)
  return (
    <Pane
      display='grid'
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {stats.map((stat) => (
        <Pane 
          key={`${stat.value}_${stat.label}`}
          display='flex'
          flexDirection='column'
          alignItems='center'
          marginBottom={majorScale(4)}
        >
          <Text 
            fontSize={40}
            fontWeight={900}
            marginBottom={majorScale(2)}
          >
            {stat.value}+
          </Text>
          <Text size={600}>{stat.label}</Text>
        </Pane>
      ))}
    </Pane>
  )
}