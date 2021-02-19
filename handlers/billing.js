const Stripe = require('stripe');
const stripe = Stripe('sk_test_51IHAhJHsDRF5ASkOBXJvvDl81evnBbqXr3cT44El9t9WUi098tGSR0hI6SKZiHHdHPbAudyT26V7vU4CjtqXhCnB00KPK9QDyk');
const { Brokerage } = require('.././models')
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

module.exports.createStripeCustomer = async (event, context) => {

    const request = JSON.parse(event.body)

    const brokerageId = event.pathParameters.brokerageId

    const customer = await stripe.customers.create({
        email: request.email,
    });

    const brokerage = await Brokerage.findOne({
        where: {
            id: brokerageId
        }
    })

    brokerage.stripeCustomerId = customer.id

    await brokerage.save()

    return {
        body: JSON.stringify(customer),
        statusCode: 200
    }
}

module.exports.createStripeSubscription = async (event, context) => {

    const reqBody = JSON.parse(event.body)

    try {
        await stripe.paymentMethods.attach(reqBody.paymentMethodId, {
            customer: reqBody.customerId,
        });
    } catch (error) {
        console.log(error)
        return {
            statusCode: 402
        }
    }

    let updateCustomerDefaultPaymentMethod = await stripe.customers.update(
        reqBody.customerId,
        {
            invoice_settings: {
                default_payment_method: reqBody.paymentMethodId,
            },
        }
    );

    const subscription = await stripe.subscriptions.create({
        customer: reqBody.customerId,
        items: [
            {
                price: reqBody.priceId,
                quantity: reqBody.quantity
            },
        ],
        expand: ['latest_invoice.payment_intent', 'plan.product'],
    });

    const brokerage = await Brokerage.findOne({
        where: {
            id: reqBody.brokerageId
        }
    })

    brokerage.stripeSubscriptionId = subscription.id

    await brokerage.save()

    return {
        statusCode: 200,
        body: JSON.stringify(subscription)
    }

}