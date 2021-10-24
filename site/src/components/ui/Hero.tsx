import {
  majorScale,
  Pane,
  Heading
} from 'evergreen-ui'
import { Center } from 'src/components/Layout'
import theme from 'src/theme'
import Breakpoint from 'src/components/ui/Breakpoint'


export default function Hero({
  text,
  backgroundImage,
  align = 'center'
}: {
  text: string
  backgroundImage: string
  align?: 'top' | 'bottom' | 'center'
}) {
  const content = (
    <Pane
      padding={majorScale(2)}
      backgroundColor={theme.colors.white.alpha(0.5).rgb().string()}
    >
      <Heading size={900}>{text} Trainings</Heading>
    </Pane>
  )
  return (
    <>
      <Breakpoint xsmall>
        <Center
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize='cover'
          backgroundPosition={align}
          backgroundRepeat='no-repeat'
          minHeight='30vh'
        >
          {content}
        </Center>
      </Breakpoint>
      <Breakpoint small>
        <Center
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize='cover'
          backgroundPosition={align}
          backgroundRepeat='no-repeat'
          minHeight='40vh'
        >
          {content}
        </Center>
      </Breakpoint>
      <Breakpoint medium>
        <Center
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize='cover'
          backgroundPosition={align}
          backgroundRepeat='no-repeat'
          minHeight='66vh'
        >
          {content}
        </Center>
      </Breakpoint>
      <Breakpoint medium>
        <Center
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize='cover'
          backgroundPosition={align}
          backgroundRepeat='no-repeat'
          minHeight='75vh'
        >
          {content}
        </Center>
      </Breakpoint>
      <Breakpoint large up>
        <Center
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize='cover'
          backgroundPosition={align}
          backgroundRepeat='no-repeat'
          minHeight='85vh'
        >
          {content}
        </Center>
      </Breakpoint>
    </>
  )
}