import _ from 'radash'
import { atom, selector } from 'recoil'
import * as t from '../types'


export const searchState = atom<t.SearchQuery>({
    key: 'px.state.search',
    default: {
        page: 0,
        pageSize: 25
    }
})

export const queryState = selector<t.SearchQuery>({
    key: 'px.state.search.filters',
    get: ({ get }) => {
        return get(searchState)
    },
    set: ({ get, set }, filters: Partial<t.SearchQuery> | any) => {
        set(searchState, _.shake({
            ...get(searchState),
            ...filters
        }))
    }
})