module.exports.getCusomerSpend = (customer) => {
    const locations = await customer.getCustomerLocations()

            const spendForLocation = await locations.map(async cLocation => {

                const location = await cLocation.getLocation()

                const lanes = await location.getLanes()

                const spendForLane = lanes.map(lane => {

                    const spend = lane.frequency * lane.rate

                    return spend
                })

                return spendForLane
            })

            const final = await Promise.all(spendForLocation)

            const sumPerLocation = final.map(item => item.reduce((a, b) => a + b, 0))

            const sumForCustomer = sumPerLocation.reduce((a, b) => a + b, 0)

            return sumForCustomer
}