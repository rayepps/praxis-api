import { useEffect, useRef } from 'react'
import parseUrl from 'url-parse'
import Recoil, { useSetRecoilState } from 'recoil'
import { useRecoilState } from 'recoil'
import styled from 'styled-components'
import { currentEventState, searchState } from '../../../state/search'
import ComplexQueryString from '../../../util/ComplexQueryString'
import * as api from '../../../api'
import { Stack, Axis } from '../../Layout'
import * as t from '../../../types'
import { useFetch } from '../../../hooks'
import { queryState } from '../../../state/search'
import { majorScale } from 'evergreen-ui'
import { useCurrentBreakpointName } from 'react-socks'

import SearchForm from './SearchForm'
import EventGrid from './EventGrid'
import SummaryBar from './SummaryBar'
import PaginationBar from './PaginationBar'
import EventDetailModal from './EventDetailModal'

import 'react-modern-calendar-datepicker/lib/DatePicker.css'

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

export default function SearchScene() {
  return (
    <Recoil.RecoilRoot>
      <StyledApp>
        <UrlStateSync />
        <SearchSceneContent />
      </StyledApp>
    </Recoil.RecoilRoot>
  )
}


export function SearchSceneContent() {

  const topOfListRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useRecoilState(queryState)
  const breakpoint = useCurrentBreakpointName()

  const searchEventsRequest = useFetch(api.searchEvents)
  const listCompaniesRequest = useFetch(api.listCompanies)
  const listTagsRequest = useFetch(api.listTags)

  const setFilters = (newFilters: t.SearchFilters) => setQuery({
    ...query,
    ...newFilters
  })

  const searchEvents = async () => {
    const { error } = await searchEventsRequest.fetch(query)
    if (error) {
      // TODO: Show user
      console.error(error)
      return
    }
  }

  const listCompanies = async () => {
    const { error } = await listCompaniesRequest.fetch({})
    if (error) {
      // TODO: Show user
      console.error(error)
      return
    }
  }

  const listTags = async () => {
    const { error } = await listTagsRequest.fetch({})
    if (error) {
      // TODO: Show user
      console.error(error)
      return
    }
  }

  const updateOrder = (orderBy: t.OrderBy, orderAs: t.OrderAs) => setQuery({
    ...query,
    orderBy,
    orderAs
  })

  const updatePage = (newPage: number) => {
    setQuery({
      ...query,
      page: newPage
    })
    topOfListRef.current?.scrollIntoView()
  }

  useEffect(() => {
    searchEvents()
  }, [query.hash])

  useEffect(() => {
    listCompanies()
    listTags()
  }, [])

  const events = searchEventsRequest.data?.events ?? []
  const total = searchEventsRequest.data?.total ?? 0
  const companies = listCompaniesRequest.data?.companies ?? []
  const tags = listTagsRequest.data?.tags ?? []

  const orientation = breakpoint === 'medium' || breakpoint.includes('large')
    ? 'split'
    : 'stack'

  return (
    <>
      <EventDetailModal />
      <Axis $stackOrSplit={orientation}>
        <SearchForm
          filters={query}
          companies={companies}
          tags={tags}
          onFiltersChange={setFilters}
        />
        <Stack
          ref={topOfListRef}
          paddingX={majorScale(4)}
          flex={1}
        >
          <SummaryBar
            total={total}
            pageNumber={query.page}
            pageSize={query.pageSize}
            orderBy={query.orderBy}
            orderAs={query.orderAs}
            onOrderChange={updateOrder}
          />
          <EventGrid
            loading={searchEventsRequest.loading}
            events={events}
          />
          <PaginationBar
            total={total}
            page={query.page}
            pageSize={query.pageSize}
            onPageChange={updatePage}
          />
        </Stack>
      </Axis>
    </>
  )
}