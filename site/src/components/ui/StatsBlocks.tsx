import {
  majorScale,
  Pane,
  Text
} from 'evergreen-ui'
import Breakpoint from 'src/components/ui/Breakpoint'


interface Stat {
  value: number
  label: string
}

const GridWrapper = ({
  columns,
  className = '',
  children
}: {
  columns: number
  className?: string
  children: React.ReactNode
}) => {
  return (
    <Pane
      className={className}
      display='grid'
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      columnGap={majorScale(4)}
      rowGap={majorScale(4)}
      paddingTop={majorScale(4)}
      paddingBottom={majorScale(4)}
    >
      {children}
    </Pane>
  )
}

export default function StatsBlocks({
  stats
}: {
  stats: Stat[]
}) {
  const blocks = (
    <>
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
    </>
  )
  return (
    <>
      <Breakpoint xsmall>
        <GridWrapper columns={1}>
          {blocks}
        </GridWrapper>
      </Breakpoint>
      <Breakpoint small>
        <GridWrapper columns={2}>
          {blocks}
        </GridWrapper>
      </Breakpoint>
      <Breakpoint medium up>
        <GridWrapper columns={4}>
          {blocks}
        </GridWrapper>
      </Breakpoint>
    </>
  )
}