import Stripe from 'stripe'
import config from '../../config'
import * as t from '../types'
import _ from 'radash'


export class StripeClient {

    stripe: Stripe

    constructor(
        stripe: Stripe
    ) {
        this.stripe = stripe
    }

    async createCard({
        cardholderId
    }: {
        cardholderId: string
    }) {
        const card = await this.stripe.issuing.cards.create({
            cardholder: cardholderId,
            currency: 'usd',
            type: 'virtual'
        })
        console.log(card)
        return card
    }

    async getCardSecrets({
        stripeCardId
    }: {
        stripeCardId: string
    }) {
        const details = await this.stripe.issuing.cards.retrieveDetails(stripeCardId)
        console.log(details)
        return details
    }

    async getPaymentMethod({
        paymentMethodId
    }: {
        paymentMethodId: string
    }): Promise<{
        id: string
        type: 'card' | 'ach'
        card: null | {
            last4: string,
            brand: string
        }
        ach: null | {
            bank: string
            last4: string
        }
    }> {

        const [error, pm] = await _.tryit<any>(async () => {
            return this.stripe.paymentMethods.retrieve(paymentMethodId)
        })();

        if (error) {
            console.error(error)
            return null
        }

        return {
            id: pm.id,
            type: pm.type === 'card' ? 'card' : 'ach',
            card: pm.type === 'card' ? {
                last4: pm.card.last4,
                brand: pm.card.brand
            } : null,
            ach: pm.type == 'acss_debit' ? {
                bank: pm.acss_debit.bank_name,
                last4: pm.acss_debit.last4
            } : null,
        }
    }

    async createCardholder({
        name,
        email,
        street,
        unit,
        city,
        state,
        country,
        zip
    }: {
        name: string
        email: string
        street: string
        unit: string
        city: string
        state: string
        country: string
        zip: string
    }) {
        const cardholder = await this.stripe.issuing.cardholders.create({
            type: 'individual',
            name: name,
            email: email,
            billing: {
                address: {
                    line1: street,
                    line2: unit,
                    city: city,
                    state: state,
                    country: country,
                    postal_code: zip
                }
            }
        })
        return cardholder
    }
}

const makeStripe = () => new StripeClient(new Stripe(config.stripeSecret, undefined))

export default makeStripe

//
// WEBHOOK AUTH
//

export async function withStripeWebhookAuth(func: t.ComposedApiFunc, webhookSecret: string, props: t.ApiRequestProps<any, { stripe: StripeClient }>) {
    const { headers } = props.meta
    const { stripe } = props.services

    const rawBody = Buffer.from('')

    const signature = headers['stripe-signature']
    const bodyString = rawBody.toString('utf8')

    const [err, event] = await _.tryit(stripe.stripe.webhooks.constructEvent)(bodyString, signature, webhookSecret)

    if (err) {
        throw new Error(`Stripe Webhook Error: ${err.message}`)
    }

    return await func({
        ...props,
        args: {
            ...props.args,
            event
        }
    })
}

export const useStripeWebhookAuth = (webhookSecret: string) => (func: t.ComposedApiFunc) => {
    return _.partial(withStripeWebhookAuth, func, webhookSecret)
}
