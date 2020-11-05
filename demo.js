const { Customer, Load, CustomerContact, CustomerLocation, CustomerLane, Team, LanePartner, User } = require('./models')

async function run() {

    const cLane = await CustomerLane.findOne({
        where: {
            id: 52
        },
        include: [{
            model: Load
        }]
    })


    const loads = await cLane.getLoads()

    // console.log(loads)

    const dates = loads.map(load => load.dropDate)

    const count = dates.length



    // create array of week objects 

    console.log(frequency)

    console.log(dates)
    // console.log(cLane.toJSON())

}

run()