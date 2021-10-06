import { useEffect } from 'react'
// import {
//     Pane
// } from 'evergreen-ui'
import { Split } from './Layout'
import * as api from '../api'
import * as t from '../types'
import { useFetch } from 'src/hooks'
import SearchForm from './SearchForm'
import EventGrid from './EventGrid'
import { useRecoilState } from 'recoil'
import { queryState } from 'src/state/search'


export default function SearchScene() {

    const [query, setQuery] = useRecoilState(queryState)

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

    useEffect(() => {
        searchEvents()
    }, [query])

    useEffect(() => {
        listCompanies()
        listTags()
    }, [])

    const events = searchEventsRequest.data?.events ?? []
    const companies = listCompaniesRequest.data?.companies ?? []
    const tags = listTagsRequest.data?.tags ?? []

    return (
        <Split>
            <SearchForm
                filters={query}
                companies={companies}
                tags={tags}
                onFiltersChange={setFilters}
            />
            <EventGrid events={events} />
        </Split>
    )
}