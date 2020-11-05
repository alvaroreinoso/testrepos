const dateFns = require('date-fns')
const { CustomerLane } = require('./models')

module.exports.getFrequency = async (customerLaneId) => {

    const cLane = await CustomerLane.findOne({
        where: {
            id: customerLaneId
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

        return frequency

    } else {

        const numberOfWeeks = daysBetween / 7

        const frequency = count / numberOfWeeks

        const roundedFrequency = Math.round(frequency)

        return roundedFrequency
    }

}