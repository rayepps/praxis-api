import {
  majorScale,
  Pane,
  Heading
} from 'evergreen-ui'
import { Center } from 'src/components/Layout'
import theme from 'src/theme'
import { useBreakpoint } from 'src/hooks'

export default function Hero({
  text,
  backgroundImage,
  align = 'center'
}: {
  text: string
  backgroundImage: string
  align?: 'top' | 'bottom' | 'center'
}) {
  const breakpoint = useBreakpoint()
  const height = breakpoint.select({
    xsmall: '30vh',
    small: '40vh',
    medium: '66vh',
    large: '75vh',
    xlarge: '85vh'
  })
  return (
    <Center
      backgroundImage={`url(${backgroundImage})`}
      backgroundSize='cover'
      backgroundPosition={align}
      backgroundRepeat='no-repeat'
      minHeight={height}
    >
      <Pane
        padding={majorScale(2)}
        backgroundColor={theme.colors.white.alpha(0.5).rgb().string()}
      >
        <Heading size={900}>{text} Trainings</Heading>
      </Pane>
    </Center>
  )
}