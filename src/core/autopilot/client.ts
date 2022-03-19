import _ from 'radash'
import { AxiosStatic } from 'axios'

// https://help.autopilotapp.com/developer/latest/api-reference/person/merge.html#person-fields

const url = 'https://api.ap3api.com'

const makeAutopilotClient = (axios: AxiosStatic, key: string) => ({
  createPerson: async (person: {
    email: string 
    firstName: string 
    lastName: string 
    ipAddress: string
  }) => {
    await axios.post(`${url}/v1/person/merge`, {
      people: [{
        fields: {
          'str::first': person.firstName,
          'str::last': person.lastName,
          'str::email': person.email,
          'bol::p': true, // is subscribed to emails
          'str::s-ctx': 'Subscribed via Praxis website'
        },
        location: {
          source_ip: person.ipAddress
        }
      }],
      async: true,
      merge_by: ['str::email'],
      merge_strategy: 2, // overwrite
      find_strategy: 0
    }, {
      headers: {
        'X-Api-Key': key
      }
    })
  },
  unsubscribePerson: async (email: string) => {
    await axios.post(`${url}/v1/person/merge`, {
      people: [{
        fields: {
          'str::email': email,
          'bol::p': false, // is subscribed to emails
          'str::u-ctx': 'Unsubscribed via Praxis unsubscribe page'
        }
      }],
      async: true,
      merge_by: ['str::email'],
      merge_strategy: 2, // overwrite
      find_strategy: 0
    }, {
      headers: {
        'X-Api-Key': key
      }
    })
  },
  sendActivity: async (email: string) => {
    await axios.post(`${url}/v1/person/merge`, {
      activities: [
        {
          "activity_id":"act:cm:send-email",
          "fields": {
            "str::first": "Chris",
            "str::last": "Smith",
            "str::email": "chris.smith@example.com"
          },
          "attributes": {
            "str:cm:subject": "Find out how to send emails via the API",
            "str:cm:preview": "A full guide to sending emails",
            "str:cm:body": "<p><strong>Bolded text for your pleasure</strong></p>"
          }
        }
      ]}, {
      headers: {
        'X-Api-Key': key
      }
    })
  }
})

export type Autopilot = ReturnType<typeof makeAutopilotClient>

export default makeAutopilotClient
