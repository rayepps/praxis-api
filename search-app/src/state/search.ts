import _ from 'radash'
import { atom, selector } from 'recoil'
import * as t from '../types'

interface SearchState {
    filters: t.SearchFilter
}

export const searchState = atom<SearchState>({
    key: 'px.state.search',
    default: {
        filters: {}
    }
})

export const filtersState = selector<t.SearchFilter>({
    key: 'px.state.search.filters',
    get: ({ get }) => {
        return get(searchState).filters
    },
    set: ({ get, set }, filters: Partial<t.SearchFilter> | any) => {
        set(searchState, {
            filters: _.shake({
                ...get(searchState).filters,
                ...filters
            })
        })
    }
})