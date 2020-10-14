const { Customer, CustomerLocation, Lane, LanePartner, CustomerLane, User, LaneOwner } = require('./models');

async function run() {


    await LaneOwner.create({
        userId: 1,
        customerLaneId: 1
    })
    const user = await User.findOne({
        where: {
            id: 1
        },
        include: [{
            model: CustomerLane
        }]
    })

    // const user = await CustomerLane.findOne({
    //     where: {
    //         id: 1
    //     },
    //     include: [{
    //         model: User
    //     }]
    // })

    console.log(user.dataValues, user.CustomerLanes)
}

run()