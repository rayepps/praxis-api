import WebflowApi from 'webflow-api'
// import * as t from '../types'


export class Webflow {

  constructor(
    private api: WebflowApi
  ) {
    console.log(this.api)
  }

  // api.site({ siteId: '580e63e98c9a982ac9b8b741' }).then(site => console.log(site));

}