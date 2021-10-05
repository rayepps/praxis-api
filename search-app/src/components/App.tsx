import { useEffect } from 'react'
import Recoil from 'recoil'
import styled from 'styled-components'
import { windowBreakpointState, windowSizeState } from '../state/ui'
import { 
    useWindowSize,
    useQueryString
} from '../hooks'

import SearchScene from './SearchScene'

import 'react-modern-calendar-datepicker/lib/DatePicker.css'
import '../styles/reset.css'
import '../styles/index.css'

const StyledApp = styled.div`
  min-height: 100vh;
`

function WindowSizeStateSync() {
    const size = useWindowSize()
    const setBreakpoint = Recoil.useSetRecoilState(windowBreakpointState)
    const setWindowSize = Recoil.useSetRecoilState(windowSizeState)
    useEffect(() => {
        if (!size) return
        setBreakpoint(size.breakpoint)
    }, [size?.breakpoint])
    useEffect(() => {
        if (!size?.width || !size?.height) return
        setWindowSize({ width: size?.width, height: size.height })
    }, [size?.height, size?.width])
    return null
}

function UrlStateSync() {
    const qs = useQueryString()
    useEffect(() => {
        if (qs) return undefined
    }, [])
    return null
}

export default function App() {
    return (
        <Recoil.RecoilRoot>
            <StyledApp>
                <WindowSizeStateSync />
                <UrlStateSync />
                <SearchScene />
            </StyledApp>
        </Recoil.RecoilRoot>
    )
}