const { getRoute } = require('../helpers/mapbox')
const { Lane } = require('../models');
const fs = require('fs')

async function addGeom(lane) {

    const origin = await lane.getOrigin()

    const destination = await lane.getDestination()

    const [route, mileage] = await getRoute(origin.lnglat, destination.lnglat)

    return route
}

async function run() {

    const lanes = await Lane.findAll()

    const lanesWithRoutes = await Promise.all(lanes.map(async lane => {
        const geo = await addGeom(lane)

        lane.routeGeometry = geo

        const record = lane.toJSON()

        delete record.id
        delete record.spend
        delete record.opportunitySpend
        delete record.potentialSpend

        return record
    }))

    const data = JSON.stringify(lanesWithRoutes)

    await fs.writeFile('./data/lanesWithRoutes.json', data, err => {
        if (err) {
          console.error(err)
          return
        }
    })
}

run()