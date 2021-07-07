'use strict';
const AWS = require('aws-sdk')
AWS.config.region = 'us-east-1';
const stepfunctions = new AWS.StepFunctions()
const { newLoad, lastDropIsCustomer, firstPickIsCustomer, matchedInternalLane, getLngLat, getRoute, getDropDate, getAddress, getLpAddress, getRate } = require('.././helpers/upload')
const { Location, Load, Customer, CustomerLocation, Lane, LanePartner, Carrier } = require('.././models');
const getCurrentUser = require('.././helpers/user')
const db = require('../models/index')

module.exports.entry = async (event, context, callback) => {

    const user = await getCurrentUser(event.token)

    const brokerageId = user.brokerageId

    const lanes = event.body

    await lanes.forEach(async lane => { lane.brokerageId = brokerageId });

    return lanes
};

module.exports.mapTask = async (event, context, callback) => {

    const row = event

    const customer = await Customer.build({
        name: row['Customer Name'],
        brokerageId: row.brokerageId
    })

    const originAddress = `${row['Origin City']}, ${row['Origin State']}`
    const originLngLat = await getLngLat(originAddress)

    const originLocation = await Location.build({
        address: originAddress,
        lnglat: originLngLat,
        brokerageId: row.brokerageId
    })

    const destinationAddress = `${row['Destination City']}, ${row['Destination State']}`
    const destinationLngLat = await getLngLat(destinationAddress)

    const destinationLocation = await Location.build({
        address: destinationAddress,
        lnglat: destinationLngLat,
        brokerageId: row.brokerageId
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

    // bulk insert customers and locations

    // pass body to next map task

    // map over lanes

    const origins = await event.map(lane => lane.originLocation)

    const test = await Location.bulkCreate(origins, {
        ignoreDuplicates: true
    })

    return test

    // let finishedLoads = []


    // for (const row of event) {

    //     console.log(row)
        // if (row.status == 'new load') {

        //     const json = row.body

        //     console.log(json['Load ID'])

        //     if (await matchedInternalLane(json)) {

        //         const [customer, customerWasCreated] = await Customer.findCreateFind({
        //             where: {
        //                 name: json.Customer,
        //                 brokerageId: json.brokerageId,
        //             },
        //         })

        //         const [firstLocation, firstLocationWasCreated] = await Location.findCreateFind({
        //             where: {
        //                 address: row.firstAddress,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (firstLocationWasCreated) {

        //             firstLocation.city = json['First Pick City']
        //             firstLocation.state = json['First Pick State']
        //             firstLocation.zipcode = json['First Pick Postal'].toString()
        //             firstLocation.lnglat = row.firstLngLat

        //             await firstLocation.save()
        //         }

        //         const [customerLocation, clWasCreated] = await CustomerLocation.findCreateFind({
        //             where: {
        //                 locationId: firstLocation.id,
        //                 customerId: customer.id
        //             }
        //         })

        //         const [secondLocation, secondLocationWasCreated] = await Location.findCreateFind({
        //             where: {
        //                 address: row.secondAddress,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (secondLocationWasCreated) {

        //             secondLocation.city = json['Last Drop City']
        //             secondLocation.state = json['Last Drop State']
        //             secondLocation.zipcode = json['Last Drop Postal'].toString()
        //             secondLocation.lnglat = row.secondLngLat

        //             await secondLocation.save()
        //         }

        //         const [secondCustomerLocation, secondClWasCreated] = await CustomerLocation.findCreateFind({
        //             where: {
        //                 locationId: secondLocation.id,
        //                 customerId: customer.id
        //             }
        //         })


        //         const [lane, laneWasCreated] = await Lane.findCreateFind({
        //             where: {
        //                 originLocationId: firstLocation.id,
        //                 destinationLocationId: secondLocation.id,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })


        //         if (laneWasCreated) {

        //             const [route, mileage] = await getRoute(row.firstLngLat, row.secondLngLat)

        //             lane.routeGeometry = route
        //             lane.mileage = mileage

        //             await lane.save()
        //         }

        //         const [carrier, carrierWasCreated] = await Carrier.findCreateFind({
        //             where: {
        //                 name: json['Carrier']
        //             }
        //         })

        //         const rate = await getRate(json)

        //         console.log(rate)

        //         const newLoad = await Load.create({
        //             loadId: json['Load ID'],
        //             brokerageId: json.brokerageId,
        //             laneId: lane.id,
        //             carrierId: carrier.id,
        //             rate: rate,
        //             dropDate: row.dropDate
        //         })

        //         const response = {
        //             customer: customer,
        //             firstLocation: firstLocation,
        //             secondLocation: secondLocation,
        //             lane: lane.id,
        //             status: 'new load',
        //             loadId: json['Load ID']
        //         }

        //         finishedLoads.push(response)

        //     }


        //     else if (await firstPickIsCustomer(json)) {

        //         const [customer, customerWasCreated] = await Customer.findCreateFind({
        //             where: {
        //                 name: json.Customer,
        //                 brokerageId: json.brokerageId,
        //             },
        //         })

        //         const [firstLocation, firstLocationWasCreated] = await Location.findCreateFind({
        //             where: {
        //                 address: row.firstAddress,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (firstLocationWasCreated) {

        //             firstLocation.city = json['First Pick City']
        //             firstLocation.state = json['First Pick State']
        //             firstLocation.zipcode = json['First Pick Postal'].toString()
        //             firstLocation.lnglat = row.firstLngLat

        //             await firstLocation.save()
        //         }

        //         const [customerLocation, clWasCreated] = await CustomerLocation.findCreateFind({
        //             where: {
        //                 locationId: firstLocation.id,
        //                 customerId: customer.id
        //             }
        //         })

        //         const [secondLocation, secondLocationWasCreated] = await Location.findCreateFind({
        //             where: {
        //                 address: row.secondAddress,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (secondLocationWasCreated) {

        //             secondLocation.city = json['Last Drop City']
        //             secondLocation.state = json['Last Drop State']
        //             secondLocation.zipcode = json['Last Drop Postal'].toString()
        //             secondLocation.lnglat = row.secondLngLat

        //             await secondLocation.save()
        //         }

        //         const [lanePartner, lPWasCreated] = await LanePartner.findCreateFind({
        //             where: {
        //                 locationId: secondLocation.id,
        //                 name: json['Last Drop Name']
        //             }
        //         })

        //         const [lane, laneWasCreated] = await Lane.findCreateFind({
        //             where: {
        //                 originLocationId: firstLocation.id,
        //                 destinationLocationId: secondLocation.id,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (laneWasCreated) {

        //             const [route, mileage] = await getRoute(row.firstLngLat, row.secondLngLat)

        //             lane.routeGeometry = route
        //             lane.mileage = mileage

        //             await lane.save()
        //         }

        //         const [carrier, carrierWasCreated] = await Carrier.findCreateFind({
        //             where: {
        //                 name: json['Carrier']
        //             }
        //         })


        //         const rate = await getRate(json)

        //         console.log(rate)

        //         const newLoad = await Load.create({
        //             loadId: json['Load ID'],
        //             brokerageId: json.brokerageId,
        //             laneId: lane.id,
        //             carrierId: carrier.id,
        //             rate: rate,
        //             dropDate: row.dropDate
        //         })

        //         const response = {
        //             customer: customer,
        //             firstLocation: firstLocation,
        //             secondLocation: secondLocation,
        //             lane: lane.id,
        //             status: 'new load',
        //             loadId: json['Load ID']
        //         }

        //         finishedLoads.push(response)
        //     }

        //     else if (await lastDropIsCustomer(json)) {

        //         const [customer, customerWasCreated] = await Customer.findCreateFind({
        //             where: {
        //                 name: json.Customer,
        //                 brokerageId: json.brokerageId,
        //             },
        //         })

        //         const [firstLocation, firstLocationWasCreated] = await Location.findCreateFind({
        //             where: {
        //                 address: row.firstAddress,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (firstLocationWasCreated) {

        //             firstLocation.city = json['First Pick City']
        //             firstLocation.state = json['First Pick State']
        //             firstLocation.zipcode = json['First Pick Postal'].toString()
        //             firstLocation.lnglat = row.firstLngLat

        //             await firstLocation.save()
        //         }

        //         const [lanePartner, lPWasCreated] = await LanePartner.findCreateFind({
        //             where: {
        //                 locationId: firstLocation.id,
        //                 name: json['First Pick Name']
        //             }
        //         })

        //         const [secondLocation, secondLocationWasCreated] = await Location.findCreateFind({
        //             where: {
        //                 address: row.secondAddress,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (secondLocationWasCreated) {

        //             secondLocation.city = json['Last Drop City']
        //             secondLocation.state = json['Last Drop State']
        //             secondLocation.zipcode = json['Last Drop Postal'].toString()
        //             secondLocation.lnglat = row.secondLngLat

        //             await secondLocation.save()
        //         }

        //         const [customerLocation, clWasCreated] = await CustomerLocation.findCreateFind({
        //             where: {
        //                 locationId: secondLocation.id,
        //                 customerId: customer.id
        //             }
        //         })

        //         const [lane, laneWasCreated] = await Lane.findCreateFind({
        //             where: {
        //                 originLocationId: firstLocation.id,
        //                 destinationLocationId: secondLocation.id,
        //                 brokerageId: json.brokerageId,
        //             }
        //         })

        //         if (laneWasCreated) {

        //             const [route, mileage] = await getRoute(row.firstLngLat, row.secondLngLat)

        //             lane.routeGeometry = route
        //             lane.mileage = mileage
        //             lane.inbound = true

        //             await lane.save()
        //         }

        //         const [carrier, carrierWasCreated] = await Carrier.findCreateFind({
        //             where: {
        //                 name: json['Carrier']
        //             }
        //         })

        //         const rate = await getRate(json)

        //         console.log(rate)

        //         const newLoad = await Load.create({
        //             loadId: json['Load ID'],
        //             brokerageId: json.brokerageId,
        //             laneId: lane.id,
        //             carrierId: carrier.id,
        //             rate: rate,
        //             dropDate: row.dropDate
        //         })

        //         const response = {
        //             customer: customer,
        //             firstLocation: firstLocation,
        //             secondLocation: secondLocation,
        //             lane: lane.id,
        //             status: 'new load',
        //             loadId: json['Load ID']
        //         }

        //         finishedLoads.push(response)
        //     }

        //     else {

        //         console.log('unmatched load')
        //     }
        // }
    // }

    // return finishedLoads

}


module.exports.pollFunction = async (event, context) => {

    const executionArn = event.queryStringParameters.executionArn

    const params = {
        executionArn: executionArn
    };

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
            }
        }

    } catch (err) {

        console.log(err)
        return {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            statusCode: 500,
            body: JSON.stringify(err)
        }
    }
}