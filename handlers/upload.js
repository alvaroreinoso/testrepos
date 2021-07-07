'use strict'
const AWS = require('aws-sdk')
AWS.config.region = 'us-east-1'
const stepfunctions = new AWS.StepFunctions()
const {
  newLoad,
  lastDropIsCustomer,
  firstPickIsCustomer,
  matchedInternalLane,
  getLngLat,
  getRoute,
  getDropDate,
  getAddress,
  getLpAddress,
  getRate,
} = require('.././helpers/upload')
const {
  Location,
  Load,
  Customer,
  CustomerLocation,
  Lane,
  LanePartner,
  Carrier,
} = require('.././models')
const getCurrentUser = require('.././helpers/user')
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

  const customer = await Customer.build({
    name: row['Customer Name'],
    brokerageId: row.brokerageId,
  })

  const originAddress = `${row['Origin City']}, ${row['Origin State']}`
  const originLngLat = await getLngLat(originAddress)

  const originLocation = await Location.build({
    address: originAddress,
    city: row['Origin City'],
    state: row['Origin State'],
    lnglat: originLngLat,
    brokerageId: row.brokerageId,
  })

  const destinationAddress = `${row['Destination City']}, ${row['Destination State']}`
  const destinationLngLat = await getLngLat(destinationAddress)

  const destinationLocation = await Location.build({
    address: destinationAddress,
    city: row['Destination City'],
    state: row['Destination State'],
    lnglat: destinationLngLat,
    brokerageId: row.brokerageId,
  })

  const resp = {
    body: row,
    customer: customer,
    originLocation: originLocation,
    destinationLocation: destinationLocation,
  }

  return resp
}

module.exports.reduce = async (event, context) => {
  let newLanes = []

  for (const row of event) {
    const [customer, newCustomer] = await Customer.findCreateFind({
      where: {
        name: row.customer.name,
        brokerageId: row.body.brokerageId,
      },
    })

    const [origin, newOrigin] = await Location.findCreateFind({
      where: {
        address: row.originLocation.address,
        city: row.originLocation.city,
        state: row.originLocation.state,
        brokerageId: row.body.brokerageId,
      },
    })

    if (newOrigin) {
      await CustomerLocation.create({
        locationId: origin.id,
        customerId: customer.id,
      })
    }

    const [destination, newDestination] = await Location.findCreateFind({
      where: {
        address: row.destinationLocation.address,
        city: row.destinationLocation.city,
        state: row.destinationLocation.state,
        brokerageId: row.body.brokerageId,
      },
    })

    if (newDestination) {
      await CustomerLocation.create({
        locationId: destination.id,
        customerId: customer.id,
      })
    }

    const [lane, newLane] = await Lane.findOrBuild({
      where: {
        brokerageId: row.body.brokerageId,
        originLocationId: origin.id,
        destinationLocationId: destination.id,
      },
    })

    if (newLane) {
      newLanes.push(lane)
    }
  }

  return newLanes
}

module.exports.secondMapTask = async (event, context) => {

    // save all new lanes with routes
    return event
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
