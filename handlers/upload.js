'use strict'
const AWS = require('aws-sdk')
AWS.config.region = 'us-east-1'
const stepfunctions = new AWS.StepFunctions()
const { getLngLat, getTruckTypeString, getVolumeStates, getRate } = require('.././helpers/upload')
const {
  Location,
  Customer,
  CustomerLocation,
  Lane,
} = require('.././models')
const getCurrentUser = require('.././helpers/user')
const { getRoute } = require('../helpers/mapbox')
const uploadNotification = require('../ses/templates/uploadNotification')
const db = require('../models/index')

module.exports.entry = async (event, context, callback) => {
  const user = await getCurrentUser(event.token)

  const brokerageId = user.brokerageId

  const lanes = event.body

  await lanes.forEach(async (lane) => {
    lane.brokerageId = brokerageId
    lane.email = user.email
  })

  return lanes
}

module.exports.mapTask = async (event, context, callback) => {
  const row = event

  const originAddress = `${row['Origin City']}, ${row['Origin State']}`
  const originLngLat = await getLngLat(originAddress)

  const destinationAddress = `${row['Destination City']}, ${row['Destination State']}`
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

    const [lane, newLane] = await Lane.findCreateFind({
      where: {
        brokerageId: row.body.brokerageId,
        originLocationId: origin.id,
        destinationLocationId: destination.id,
      },
    })

    if (newLane) {
        const laneTemplate = {
            // could include customer name here
            lane: lane,
            email: row.body.email,
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
}

module.exports.secondMapTask = async (event, context) => {
    const route = await getRoute(event.originlnglat, event.destinationlnglat)
    const truckType = getTruckTypeString(event.truckType)
    const volumeStates = getVolumeStates(event)
    const rate = getRate(event.rate)
    
    await Lane.update({
      routeGeometry: route,
      rate: rate,
      truckType: truckType,
      currentVolume: volumeStates.currentVolume,
      opportunityVolume: volumeStates.opportunityVolume,
      potentialVolume: volumeStates.potentialVolume
    }, {
      where: {
        id: event.lane.id
      },
      individualHooks: false
    })

    const resp = {
      laneId: event.lane.id,
      email: event.email
    }

    return resp
}

module.exports.notify = async (event, context) => {
  const email = event[0].email
  await uploadNotification.uploadComplete(email)

    // await uploadNotification.uploadFailed(email)
    
  return event.length
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
