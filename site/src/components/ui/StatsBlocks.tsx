import {
  majorScale,
  Pane,
  Text
} from 'evergreen-ui'


interface Stat {
  value: number
  label: string
}

export default function StatsBlocks({
  stats
}: {
  stats: Stat[]
}) {
  return (
    <Pane 
      display='flex'
      justifyContent='space-around'
    >
      {stats.map((stat) => (
        <Pane 
          key={`${stat.value}_${stat.label}`}
          display='flex'
          flexDirection='column'
          alignItems='center'
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