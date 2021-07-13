'use strict'
const AWS = require('aws-sdk')
AWS.config.region = 'us-east-1'
const stepfunctions = new AWS.StepFunctions()
const { getLngLat } = require('.././helpers/upload')
const {
  Location,
  Customer,
  CustomerLocation,
  Lane,
} = require('.././models')
const getCurrentUser = require('.././helpers/user')
const { getRoute, parseDestinationAddress, parseOriginAddress } = require('../helpers/mapbox')
const db = require('../models/index')

module.exports.entry = async (event, context, callback) => {
  const user = await getCurrentUser(event.token)

  const brokerageId = user.brokerageId

  const lanes = event.body

  await lanes.forEach(async (lane) => {
    lane.brokerageId = brokerageId
  })

  return lanes
}

module.exports.mapTask = async (event, context, callback) => {
  const row = event

  // const originAddress = `${row['Origin City']}, ${row['Origin State']}`
  const originAddress = parseOriginAddress(row)
  const originLngLat = await getLngLat(originAddress)

  // const destinationAddress = `${row['Destination City']}, ${row['Destination State']}`
  const destinationAddress = parseDestinationAddress(row)
  const destinationLngLat = await getLngLat(destinationAddress)

  const resp = {
    body: row,
    origin: {
        address: originAddress,
        city: row['Origin City'],
        state: row['Origin State'],
        lnglat: originLngLat
    },
    destination: {
        address: destinationAddress,
        city: row['Destination City'],
        state: row['Destination State'],
        lnglat: destinationLngLat,
    }
  }

  return resp
}

module.exports.reduce = async (event, context) => {
  let newLanes = []
  let locations = []

  for (const row of event) {
    const [customer, newCustomer] = await Customer.findCreateFind({
      where: {
        name: row.body['Customer Name'],
        brokerageId: row.body.brokerageId,
      },
    })

    let origin

    const  existingOrigin = await Location.findOne({
      where: {
        address: row.origin.address,
        brokerageId: row.body.brokerageId,
      },
      include: {
        model: CustomerLocation,
        where: {
            customerId: customer.id
        },
        required: true
    }
    })

    if (existingOrigin == null) {
       origin = await Location.create({
        address: row.origin.address,
        city: row.origin.city,
        state: row.origin.state,
        zipcode: row.body['Origin Zip Code'],
        lnglat: row.origin.lnglat,
        brokerageId: row.body.brokerageId,
        })

        await CustomerLocation.create({
            locationId: origin.id,
            customerId: customer.id
        })

    } else {
        origin = existingOrigin
    }

    let destination
    const existingDestination = await Location.findOne({
      where: {
        address: row.destination.address,
        brokerageId: row.body.brokerageId,
      },
      include: [{
        model: CustomerLocation,
        where: {
            customerId: customer.id
        },
        required: true
    }]
    })

    if (existingDestination == null) {
        destination = await Location.create({
            address: row.destination.address,
            city: row.destination.city,
            state: row.destination.state,
            zipcode: row.body['Destination Zip Code'],
            lnglat: row.destination.lnglat,
            brokerageId: row.body.brokerageId,
        })

        await CustomerLocation.create({
            locationId: destination.id,
            customerId: customer.id
        })

    } else {
        destination = existingDestination
    }

    const locs = {
        customer: customer.name,
        origin: origin,
        destination: destination
    }

    locations.push(locs)

    const [lane, newLane] = await Lane.findCreateFind({
      where: {
        brokerageId: row.body.brokerageId,
        originLocationId: origin.id,
        destinationLocationId: destination.id,
      },
    })

    if (newLane) {
        const laneTemplate = {
            lane: lane,
            truckType: row.body['Truck Type'],
            rate: row.body['Customer Rate'],
            potentialVolume: row.body['Total Volume/mo'],
            ownedVolume: row.body['Owned Volume/mo'],
            originlnglat: origin.lnglat,
            destinationlnglat: destination.lnglat,
        }

      newLanes.push(laneTemplate)
    }
  }

  return newLanes
    // return locations
}

module.exports.secondMapTask = async (event, context) => {
    const route = await getRoute(event.originlnglat, event.destinationlnglat)
    const opportunityVolume = event.potentialVolume - event.ownedVolume
    
    await Lane.update({
      routeGeometry: route,
      rate: event.rate,
      truckType: event.truckType,
      ownedVolume: event.ownedVolume,
      opportunityVolume: opportunityVolume,
      potentialVolume: event.potentialVolume
    }, {
      where: {
        id: event.lane.id
      },
      individualHooks: false
    })

    return event.lane.id
}

module.exports.pollFunction = async (event, context) => {
  const executionArn = event.queryStringParameters.executionArn

  const params = {
    executionArn: executionArn,
  }

  try {
    const request = await stepfunctions.describeExecution(params).promise()

    const resp = {
      status: request.status,
      // output: JSON.parse(request.output)
    }

    return {
      body: JSON.stringify(resp),
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    }
  } catch (err) {
    console.log(err)
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 500,
      body: JSON.stringify(err),
    }
  }
}
