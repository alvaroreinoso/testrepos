const { Customer, Brokerage, CustomerLocation, LanePartner, Team, User, Location, Lane, Ledger } = require('.././models')

async function run() {
    const brokerages = await Brokerage.findAll()

    for (const brokerage of brokerages) {

        const ledger = await Ledger.create({
            brokerageId: brokerage.id
        })

        brokerage.ledgerId = ledger.id

        await brokerage.save()
    }

    console.log('Adding ledger to brokerages')
}

run()