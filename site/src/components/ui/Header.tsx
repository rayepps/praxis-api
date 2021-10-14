import {
  Pane,
  Link as EvergreenLink,
  majorScale,
  minorScale
} from 'evergreen-ui'
import Link from 'next/link'
import { Split } from '../Layout'
import Wordmark from '../svg/PraxisWordmark'
import theme from 'src/theme'

export default function Header() {
  return (
    <Split
      padding={majorScale(2)}
      borderBottom={`1px solid ${theme.colors.lightGrey.hex()}`}
      alignItems='center'
    >
      <Pane flex={1}>
        <Link href="/">
          <a>
            <Wordmark
              height={30}
            />
          </a>
        </Link>
      </Pane>
      <Pane>
        <Link
          href="/search"
          passHref
        >
          <EvergreenLink
            marginRight={majorScale(4)}
            style={{
              color: theme.colors.black.hex()
            }}
          >
            Trainings
          </EvergreenLink>
        </Link>
        <Link
          href="/about"
          passHref
        >
          <EvergreenLink
            marginRight={majorScale(4)}
            style={{
              color: theme.colors.black.hex()
            }}
          >
            About
          </EvergreenLink>
        </Link>
        <EvergreenLink
          href="https://shop.praxisco.us"
          padding={minorScale(2)}
          backgroundColor={theme.colors.black.hex()}
          style={{
            color: theme.colors.white.hex()
          }}
        >
          shop
        </EvergreenLink>
      </Pane>
    </Split>
  )
}