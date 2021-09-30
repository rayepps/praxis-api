import _ from 'radash'
import { assert } from 'chai'
import { signupWithEmailPass } from '../signupWithEmailPass'

describe('signupWithEmailPass endpoint', () => {

    test('error thrown for weak password', async () => {
        const [err] = await _.tryit<any, any>(signupWithEmailPass)({
            services: {},
            args: {
                email: 'hello@gmail.com',
                password: 'weak'
            }
        } as any)
        assert.equal(err.status, 400)
    })
    
})