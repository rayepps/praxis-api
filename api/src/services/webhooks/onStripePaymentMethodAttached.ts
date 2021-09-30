// import _ from 'radash'
// import * as t from '../../core/types'
// import makeDb, { Database } from '../../core/db'
// import { 
//     useLambda,
//     useService
// } from '../../core/http'


// interface Args {
//     email: string
// }

// interface Services {
//     db: Database
// }

// async function onStripePaymentMethodAttached ({ services, args }: t.ApiRequestProps<Args, Services>) {
//   const { db, stripe } = services
//   const { email } = args

//   // Save the payment method data to our user object
//   // in the database. Mark the user as ready for active
//   // cards.
  
// }

// export default _.compose(
//   useLambda(),
//   useWebhookAuth(),
//   useService({
//       db: makeDb()
//   }),
//   onStripePaymentMethodAttached)

export default () => {}