import {
  majorScale,
  Pane,
  Heading
} from 'evergreen-ui'
import { Center } from 'src/components/Layout'
import theme from 'src/theme'


export default function Hero({
  text,
  backgroundImage
}: {
  text: string
  backgroundImage: string
}) {
  return (
    <Center
      backgroundImage={`url(${backgroundImage})`}
      backgroundSize='cover'
      backgroundPosition='center center'
      backgroundRepeat='no-repeat'
      minHeight='50vh'
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