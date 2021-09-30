// import _ from 'radash'
// import * as t from '../../core/types'
// import makeDb, { Database } from '../../core/db'
// import { 
//     useLambda,
//     useService
// } from '../../core/http'
// import config from '../../config'
// import makeStripe, { StripeClient, useStripeWebhookAuth } from '../../core/stripe'
// import Stripe from 'stripe'


// interface Args {
//     event: Stripe.Event
// }

// interface Services {
//     db: Database
//     stripe: StripeClient
// }

// async function onStripeChargeRequest ({ services, args }: t.ApiRequestProps<Args, Services>) {
//   const { db, stripe } = services
//   const { email } = args

//   // TODO: Validate the state of the user

//   // Determine who the customer is from the charge request
//   const customerId = 'payload.user'

//   // Lookup the card/product in our database (product is created with
//   // strip each time a card is created by a user. The product is
//   // in ideal: the use of that card).
//   const card = await db.findCard(...)

//   // Create a one use price for this charge
//   const price = await stripe.prices.create({
//     unit_amount: 2000, // payload.amount
//     currency: 'usd',
//     product: card.stripeProductId,
//   })
  
//   const invoiceItem = await stripe.invoiceItems.create({
//     customer: customerId,
//     price: price.id,
//   })
// }



// export default _.compose(
//   useLambda(),
//   useService({
//       db: makeDb(),
//       stripe: makeStripe()
//   }),
//   useStripeWebhookAuth(config.stripeWebhookSecret),
//   onStripeChargeRequest
// )

export default () => {}