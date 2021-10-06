import { version } from '../package.json'


export type Env = 'local' | 'eng' | 'pr' | 'staging' | 'uat' | 'prod'

const config = {
    apiUrl: 'https://uat-api.praxisco.link',
    // apiUrl: 'http://localhost:8800',
    version
}

export type Config = typeof config

const getConfig = () => config

export default getConfig
