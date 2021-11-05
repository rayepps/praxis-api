import _ from 'radash'
import { atom, selector } from 'recoil'
import * as t from '../types'
import * as uuid from 'uuid'


const createHash = (obj: object) => {
    const str = JSON.stringify(
        _.mapValues(obj, (value: any) => {
            if (value === null) return 'h.__null__'
            if (value === undefined) return 'h.__undefined__'
            return value
        })
    )
    return uuid.v5(str, uuid.v5.DNS)
}

export const searchState = atom<t.SearchQuery>({
    key: 'px.state.search',
    default: {
        page: 1,
        pageSize: 25,
        orderBy: 'date',
        orderAs: 'asc'
    }
})

export const queryState = selector<t.SearchQuery>({
    key: 'px.state.search.filters',
    get: ({ get }) => {
        const state = get(searchState)
        const obj = _.shake({ ...state, eventId: undefined })
        return {
            ...state,
            hash: createHash(obj)
        }
    },
    set: ({ get, set }, filters: Partial<t.SearchQuery> | any) => {
        set(searchState, _.shake({
            ...get(searchState),
            ...filters
        }))
    }
})

export const currentEventState = selector<string | undefined>({
    key: 'px.state.search.current-event',
    get: ({ get }) => {
        return get(searchState).eventId
    },
    set: ({ get, set }, eventId: string | any) => {
        set(searchState, _.shake({
            ...get(searchState),
            eventId
        }))
    }
})