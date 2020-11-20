const dateFns = require('date-fns')

module.exports.getFrequency = async (lane) => {

    const loads = await lane.getLoads()

    const dates = loads.map(load => load.dropDate)

    const firstDate = dates[0]
    const lastDate = dates[dates.length - 1]

    const daysBetween = dateFns.differenceInDays(lastDate, firstDate)

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