import {
  Pane,
  Paragraph,
  Heading,
  majorScale
} from 'evergreen-ui'
import PraxisBox from '../svg/PraxisBox'
import { Split } from '../Layout'
import theme from 'src/theme'


export default function Footer() {
  return (
    <Split
      backgroundColor={theme.colors.black.hex()}
      color={theme.colors.white.hex()}
      padding={majorScale(4)}
    >
      <Pane>
        <Heading 
          size={800}
          color={theme.colors.white.hex()}
        >
          Praxis Co.
        </Heading>
        <Paragraph
          maxWidth={300}
          size={500}
          marginBottom={majorScale(4)}
        >
          The difference between theory and practice. It's time to stop thinking you're ready. Get up, get out, and get trained.
        </Paragraph>
        <PraxisBox 
          color={theme.colors.white.hex()}
          height={100}
        />
      </Pane>
    </Split>
  )
}