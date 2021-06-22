const Stripe = require('stripe');
const { Brokerage } = require('.././models')
const corsHeaders = require('.././helpers/cors')
const getCurrentUser = require('.././helpers/user');
const cors = require('.././helpers/cors');
require('dotenv').config()
const stripe = Stripe(process.env.STRIPE_API_KEY);


module.exports.webhookHandler = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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
            headers: corsHeaders,
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
        headers: corsHeaders,
        statusCode: 200
    }
}

module.exports.createStripeCustomer = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        if (user.admin == false) {
            return {
                statusCode: 403,
                headers: corsHeaders
            }
        }

        const brokerageId = event.pathParameters.brokerageId

        const brokerage = await Brokerage.findOne({
            where: {
                id: brokerageId
            }
        })

        if (brokerage.id != user.brokerageId) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        if (brokerage.stripeCustomerId != null) {
            return {
                statusCode: 409,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)

        const customer = await stripe.customers.create({
            email: request.email,
            name: request.name,
            address: request.address,
            phone: request.phone
        });

        brokerage.stripeCustomerId = customer.id

        await brokerage.save()

        return {
            headers: corsHeaders,
            body: JSON.stringify(customer),
            statusCode: 200
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.createStripeSubscription = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const reqBody = JSON.parse(event.body)

        const brokerage = await Brokerage.findOne({
            where: {
                id: reqBody.brokerageId
            }
        })

        if (brokerage.id != user.brokerageId) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        if (user.admin == false) {
            return {
                statusCode: 403,
                headers: corsHeaders
            }
        }

        if (brokerage.stripeSubscriptionId != null) {
            return {
                statusCode: 409,
                headers: corsHeaders
            }
        }

        try {
            await stripe.paymentMethods.attach(reqBody.paymentMethodId, {
                customer: reqBody.customerId,
            });
        } catch (error) {
            console.log(error)
            return {
                headers: corsHeaders,
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

        brokerage.stripeSubscriptionId = subscription.id

        await brokerage.save()

        return {
            headers: corsHeaders,
            statusCode: 200,
            body: JSON.stringify(subscription)
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getBillingDetails = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        if (user.admin == false) {
            return {
                statusCode: 403,
                headers: corsHeaders
            }
        }

        const brokerage = await Brokerage.findOne({
            where: {
                id: user.brokerageId
            }
        })

        const subscription = await stripe.subscriptions.retrieve(brokerage.stripeSubscriptionId)

        const paymentMethods = await stripe.paymentMethods.list({
            customer: subscription.customer,
            type: 'card'
        })

        const invoices = await stripe.invoices.list({
            customer: subscription.customer
        })

        const response = {
            subscription: subscription,
            paymentMethods: paymentMethods,
            invoices: invoices
        }

        return {
            body: JSON.stringify(response),
            headers: corsHeaders
        }
    } catch (err) {

        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.updateSubscription = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        if (user.admin == false) {
            return {
                statusCode: 403,
                headers: corsHeaders
            }
        }

        const brokerage = await Brokerage.findOne({
            where: {
                id: user.brokerageId
            }
        })

        const request = JSON.parse(event.body)

        const subscription = await stripe.subscriptions.update(
            brokerage.stripeSubscriptionId,
            request
        );

        return {
            statusCode: 204,
            headers: corsHeaders
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.updateDefaultPaymentMethod = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        if (user.admin == false) {
            return {
                statusCode: 403,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)

        const customer = await stripe.customers.update(
            request.customerId,
            {invoice_settings: {
                default_payment_method: request.paymentMethodId
            }}
        );

        return {
            statusCode: 204,
            headers: corsHeaders
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.createSetupIntent = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        if (user.admin == false) {
            return {
                statusCode: 403,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)

        const intent = await stripe.setupIntents.create({
            customer: request.customerId,
          });
          
        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(intent)
        }

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}