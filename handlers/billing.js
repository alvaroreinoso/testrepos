const Stripe = require('stripe');
const stripe = Stripe('sk_test_51IHAhJHsDRF5ASkOBXJvvDl81evnBbqXr3cT44El9t9WUi098tGSR0hI6SKZiHHdHPbAudyT26V7vU4CjtqXhCnB00KPK9QDyk');
require('dotenv').config()


module.exports.webhookHandler = async (event, context) => {

    const body = JSON.parse(event.body)

    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            event.headers['Stripe-Signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log(err);
        console.log(`⚠️  Webhook signature verification failed.`);
        console.log(
            `⚠️  Check the env file and enter the correct webhook secret.`
        );
        return {
            statusCode: 400
        }
    }
    // Extract the object from the event.

    const dataObject = stripeEvent.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample

    console.log(stripeEvent.type)
    switch (stripeEvent.type) {
        case 'invoice.paid':
            // Used to provision services after the trial has ended.
            // The status of the invoice will show up as paid. Store the status in your
            // database to reference when a user accesses your service to avoid hitting rate limits.
            break;
        case 'invoice.payment_failed':
            // If the payment fails or the customer does not have a valid payment method,
            //  an invoice.payment_failed event is sent, the subscription becomes past_due.
            // Use this webhook to notify your user that their payment has
            // failed and to retrieve new card details.
            break;
        case 'customer.subscription.deleted':
            if (event.request != null) {
                // handle a subscription cancelled by your request
                // from above.
            } else {
                // handle subscription cancelled automatically based
                // upon your subscription settings.
            }
            break;
        default:
        // Unexpected event type
    }
    return {
        statusCode: 200
    }
}