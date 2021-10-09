import * as t from '../types'


export class LinkRefRecord {
    static toLinkRef(record: t.LinkRefRecord): t.LinkRef {
        return {
            code: record.code,
            url: record.url,
            domain: record.domain,
            link: record.link,
            title: record.title
        }
    }
}
