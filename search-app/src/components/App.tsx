import { useEffect } from 'react'
import parseUrl from 'url-parse'
import Recoil from 'recoil'
import styled from 'styled-components'
import  { BreakpointProvider } from 'react-socks'
import { searchState } from 'src/state/search'
import ComplexQueryString from 'src/util/ComplexQueryString'

import SearchScene from './SearchScene'

import 'react-modern-calendar-datepicker/lib/DatePicker.css'
import '../styles/reset.css'
import '../styles/index.css'

const StyledApp = styled.div`
  min-height: 100vh;
`

function UrlStateSync() {
    const [search, setSearch] = Recoil.useRecoilState(searchState)

    // On first render, check if there is
    // a value in the url, parse it, and
    // set the state to it
    useEffect(() => {
        const qs = window.location.search
        if (!qs) return
        const state = ComplexQueryString.deserialize(qs)
        setSearch(state as any)
    }, [])

    // Anytime the state changes, update
    // the url in place
    useEffect(() => {
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
                <BreakpointProvider>
                    <UrlStateSync />
                    <SearchScene />
                </BreakpointProvider>
            </StyledApp>
        </Recoil.RecoilRoot>
    )
}