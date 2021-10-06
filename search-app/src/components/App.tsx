import { useEffect } from 'react'
import parseUrl from 'url-parse'
import Recoil from 'recoil'
import styled from 'styled-components'
import { windowBreakpointState, windowSizeState } from '../state/ui'
import { searchState } from 'src/state/search'
import { 
    useWindowSize
} from '../hooks'
import ComplexQueryString from 'src/util/ComplexQueryString'

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
    const [search, setSearch] = Recoil.useRecoilState(searchState)

    // On first render, check if there is
    // a value in the url, parse it, and
    // set the state to it
    useEffect(() => {
        const qs = window.location.search
        if (!qs) return
        const state = ComplexQueryString.deserialize(qs)
        console.log('got state in qs')
        console.log(state)
        setSearch(state as any)
    }, [])

    // Anytime the state changes, update
    // the url in place
    useEffect(() => {
        console.log('updating query string')
        console.log(search)
        const url = parseUrl(window.location.href)
        const state = ComplexQueryString.serialize(search)
        const newUrl = url.set('query', state)
        window.history.pushState({}, '', newUrl.toString())
    }, [search])
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