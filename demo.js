const { Customer, Lane, LanePartner, Team, CustomerLane, CustomerLocation, User, Message, Ledger } = require('./models');

async function run() {
const lanePartner = await LanePartner.findOne({
    where: {
        id: 58
    },
    include: [{
        model: CustomerLane,
        required: true,
        include: [{
            model: CustomerLocation,
            required: true,
            include: [{
                model: Customer,
                required: true,
                include: [{
                    model: Ledger,
                    required: true
                }]
            }]
        }]
    }]
})

console.log(lanePartner.CustomerLane.toJSON())
}

run()