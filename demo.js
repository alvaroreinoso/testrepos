const dateFns = require('date-fns')
const { Customer, Load, CustomerContact, CustomerLocation, CustomerLane, Team, LanePartner, User } = require('./models')

async function run() {

    const cLane = await CustomerLane.findOne({
        where: {
            id: 51
        },
    })

    const loads = await cLane.getLoads()

    const dates = loads.map(load => load.dropDate)

    const firstDate = dateFns.parseISO(dates[0])

    const lastDate = dateFns.parseISO(dates[dates.length - 1])

    const daysBetween = dateFns.differenceInDays(firstDate, lastDate)

    const count = dates.length

    if (daysBetween == 0) {

        let frequency = count

        console.log(frequency)

        return frequency
    } else {

        const numberOfWeeks = daysBetween / 7

        console.log(Math.round(numberOfWeeks))

        const frequency = count / numberOfWeeks

        console.log(frequency)

        return frequency
    }

}

run()