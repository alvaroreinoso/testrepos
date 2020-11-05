const dateFns = require('date-fns')
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

    const firstDate = dateFns.parseISO(dates[0])

    const lastDate = dateFns.parseISO(dates[dates.length - 1])

    const daysBetween = await dateFns.differenceInDays(firstDate, lastDate)

    if (daysBetween == 0) {

        let frequency = dates.length

        return frequency
    } else {

        const numberOfWeeks = daysBetween / 7

        console.log(Math.round(numberOfWeeks))
    }

    const count = dates.length

    console.log(daysBetween)

    dates.forEach(date => {
        dateFns.parseISO(date)
    })

    // get first and last, count number of days between, divide by 7





    // create array of week objects 

    // console.log(frequency)

    console.log(dates)
    // console.log(cLane.toJSON())

}

run()