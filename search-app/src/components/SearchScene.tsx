import { useEffect } from 'react'
// import {
//     Pane
// } from 'evergreen-ui'
import { Split } from './Layout'
import * as api from '../api'
// import * as t from '../types'
import { useFetch } from 'src/hooks'
import SearchForm from './SearchForm'
import EventGrid from './EventGrid'
import { useRecoilState } from 'recoil'
import { filtersState } from 'src/state/search'


export default function SearchScene() {

    const [filters, setFilters] = useRecoilState(filtersState)

    const searchEventsRequest = useFetch(api.searchEvents)
    const listCompaniesRequest = useFetch(api.listCompanies)
    const listTagsRequest = useFetch(api.listTags)

    const searchEvents = async () => {
        const { error } = await searchEventsRequest.fetch({
            filters,
            page: {
                size: 25,
                number: 0
            }
        })
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
    }, [filters])

    useEffect(() => {
        listCompanies()
        listTags()
    }, [])

    const events = searchEventsRequest.data?.events ?? []
    const companies = listCompaniesRequest.data?.companies ?? []
    const tags = listTagsRequest.data?.tags ?? []

    console.log('\nevents:')
    console.log(events)
    console.log('\nfilters:')
    console.log(filters)

    return (
        <Split>
            <SearchForm
                filters={filters}
                companies={companies}
                tags={tags}
                onFiltersChange={setFilters}
            />
            <EventGrid events={events} />
        </Split>
    )
}