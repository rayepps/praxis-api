import { useEffect, useRef } from 'react'
import { Stack, Axis } from './Layout'
import * as api from '../api'
import * as t from '../types'
import { useFetch } from 'src/hooks'
import SearchForm from './SearchForm'
import EventGrid from './EventGrid'
import SummaryBar from './SummaryBar'
import PaginationBar from './PaginationBar'
import { useRecoilState } from 'recoil'
import { queryState } from 'src/state/search'
import { majorScale } from 'evergreen-ui'
import { useCurrentBreakpointName } from 'react-socks'


export default function SearchScene() {

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
    }, [query])

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
    )
}