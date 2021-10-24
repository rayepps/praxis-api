import React from 'react'

// Imported in /pages/_app.tsx
// import './breakpoint.css'

const HIDE_AT = {
  xsmall: 'px-bp-hide-at-xsmall',
  small: 'px-bp-hide-at-small',
  medium: 'px-bp-hide-at-medium',
  large: 'px-bp-hide-at-large',
  xlarge: 'px-bp-hide-at-xlarge',
  xxlarge: 'px-bp-hide-at-xxlarge'
}

const BREAKPOINTS = {
  all: [],
  none: [HIDE_AT.xsmall, HIDE_AT.small, HIDE_AT.medium, HIDE_AT.large, HIDE_AT.xlarge, HIDE_AT.xxlarge],
  xsmall: {
    only: [HIDE_AT.xxlarge, HIDE_AT.xlarge, HIDE_AT.large, HIDE_AT.medium, HIDE_AT.small],
    up: [],
    down: [HIDE_AT.xxlarge, HIDE_AT.xlarge, HIDE_AT.large, HIDE_AT.medium, HIDE_AT.small]
  },
  small: {
    only: [HIDE_AT.xxlarge, HIDE_AT.xlarge, HIDE_AT.large, HIDE_AT.medium, HIDE_AT.xsmall],
    up: [HIDE_AT.xsmall],
    down: [HIDE_AT.xxlarge, HIDE_AT.xlarge, HIDE_AT.large, HIDE_AT.medium]
  },
  medium: {
    only: [HIDE_AT.xxlarge, HIDE_AT.xlarge, HIDE_AT.large, HIDE_AT.small, HIDE_AT.xsmall],
    up: [HIDE_AT.small, HIDE_AT.xsmall],
    down: [HIDE_AT.xxlarge, HIDE_AT.xlarge, HIDE_AT.large]
  },
  large: {
    only: [HIDE_AT.xxlarge, HIDE_AT.xlarge, HIDE_AT.medium, HIDE_AT.small, HIDE_AT.xsmall],
    up: [HIDE_AT.medium, HIDE_AT.small, HIDE_AT.xsmall],
    down: [HIDE_AT.xxlarge, HIDE_AT.xlarge]
  },
  xlarge: {
    only: [HIDE_AT.xxlarge, HIDE_AT.large, HIDE_AT.medium, HIDE_AT.small, HIDE_AT.xsmall],
    up: [HIDE_AT.large, HIDE_AT.medium, HIDE_AT.small, HIDE_AT.xsmall],
    down: [HIDE_AT.xxlarge]
  },
  xxlarge: {
    only: [HIDE_AT.xlarge, HIDE_AT.large, HIDE_AT.medium, HIDE_AT.small, HIDE_AT.xsmall],
    up: [HIDE_AT.xlarge, HIDE_AT.large, HIDE_AT.medium, HIDE_AT.small, HIDE_AT.xsmall],
    down: []
  }
}

const generateClassNames = ({
  xsmall,
  small,
  medium,
  large,
  xlarge,
  xxlarge,
  up,
  down
}: {
  xsmall: boolean
  small: boolean
  medium: boolean
  large: boolean
  xlarge: boolean
  xxlarge: boolean
  up: boolean
  down: boolean
}): string[] => {
  if (xsmall) {
    if (up) return BREAKPOINTS.xsmall.up
    if (down) return BREAKPOINTS.xsmall.down
    return BREAKPOINTS.xsmall.only
  }
  if (small) {
    if (up) return BREAKPOINTS.small.up
    if (down) return BREAKPOINTS.small.down
    return BREAKPOINTS.small.only
  }
  if (medium) {
    if (up) return BREAKPOINTS.medium.up
    if (down) return BREAKPOINTS.medium.down
    return BREAKPOINTS.medium.only
  }
  if (large) {
    if (up) return BREAKPOINTS.large.up
    if (down) return BREAKPOINTS.large.down
    return BREAKPOINTS.large.only
  }
  if (xlarge) {
    if (up) return BREAKPOINTS.xlarge.up
    if (down) return BREAKPOINTS.xlarge.down
    return BREAKPOINTS.xlarge.only
  }
  if (xxlarge) {
    if (up) return BREAKPOINTS.xxlarge.up
    if (down) return BREAKPOINTS.xxlarge.down
    return BREAKPOINTS.xxlarge.only
  }
  return BREAKPOINTS.all
}

export default function Breakpoint({
  xsmall = false,
  small = false,
  medium = false,
  large = false,
  xlarge = false,
  xxlarge = false,
  only = false,
  up = false,
  down = false,
  children
}: {
  xsmall?: boolean
  small?: boolean
  medium?: boolean
  large?: boolean
  xlarge?: boolean
  xxlarge?: boolean
  only?: boolean
  up?: boolean
  down?: boolean
  children: React.ReactNode
}) {
  if (only) {
    if (up || down) {
      console.error('Cannot specify "only" with other breakpoint modifiers ("up" or "down"). Skipping breakpiont classes.')
      return (<>{children}</>)
    }
  }
  const classNames: string[] = generateClassNames({
    xsmall, small, medium, large, xlarge, xxlarge, up, down
  })
  const bpName = ((): string => {
    if (xsmall) return 'xsmall'
    if (small) return 'small'
    if (medium) return 'medium'
    if (large) return 'large'
    if (xlarge) return 'xlarge'
    if (xxlarge) return 'xxlarge'
    return 'none'
  })()
  const modifierName = ((): string => {
    if (up) return 'up'
    if (down) return 'down'
    return 'only'
  })()
  return (
    <>
      {
        React.Children.map(children, (child: any) => {
          return React.cloneElement(child, {
            className: `${child?.props?.className ?? ''} ${classNames.join(' ')} ${`px-bp-${bpName}-${modifierName}`}`
          })
        })
      }
    </>
  )
}