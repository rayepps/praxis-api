import { useState, useEffect, useCallback } from 'react'


interface WindowSize {
    width: number
    height: number
    breakpoint: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
}

const getBreakpoint = (width: number): 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' => {
    if (width < 576) return 'xsmall'
    if (width < 768) return 'small'
    if (width < 992) return 'medium'
    if (width < 1200) return 'large'
    if (width < 1400) return 'xlarge'
    return 'xxlarge'
}

export function useWindowSize(): WindowSize | null {
    const [size, setSizes] = useState<WindowSize | null>(null)

    const updateSize = () => {
        setSizes({
            width: window.innerWidth,
            height: window.innerHeight,
            breakpoint: getBreakpoint(window.innerWidth)
        })
    }

    const onResize = useCallback(updateSize, [])

    useEffect(() => {
        window.addEventListener('resize', onResize, true)
        return () => {
            window.removeEventListener('resize', onResize, true)
        }
    }, [])

    useEffect(() => {
        updateSize()
    }, [])

    return size
}