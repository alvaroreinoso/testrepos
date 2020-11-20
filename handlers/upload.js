const { Team, CustomerContact, Endpoint, Brokerage, User, Location, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('.././models');
const { newLoad, newCustomer, newLane, lastDropIsCustomer, firstPickIsCustomer, createLane, matchedInternalLane, getOrCreateSecondLocation, currentCustomer, getLngLat, getRoute, newCarrier, getLane, getDropDate, getAddress, getLpAddress, getOriginAndDestination } = require('.././helpers/csvDump/ascend')
const csv = require('csvtojson')
const getCurrentUser = require('.././helpers/user').getCurrentUser
const getFrequency = require('.././helpers/getLoadFrequency').getFrequency

module.exports.ascendDump = async (event, context) => {

    const jsonArray = await csv().fromString(event.body)
    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {

        const unmatchedLanes = []

        for (const json of jsonArray) {

            if (await newLoad(json)) {

                const firstAddress = await getAddress(json)
                const firstLngLat = await getLngLat(json['First Pick Address'])
                const secondAddress = await getLpAddress(json)
                const secondLngLat = await getLngLat(json['Last Drop Address'])
                const dropDate = await getDropDate(json)

                if (await matchedInternalLane(json)) {

                    // TODO fix drop date format

                    console.log('matched internal: ', json['Load ID'])

                    const [customer, wasCreated] = await Customer.findOrCreate({
                        where: {
                            name: json.Customer,
                            teamId: user.teamId,
                        },
                    })

                    if (wasCreated == true) {

                        await customer.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [firstLocation, firstLocationWasCreated] = await Location.findOrCreate({
                        where: {
                            address: firstAddress,
                            city: json['First Pick City'],
                            state: json['First Pick State'],
                            zipcode: json['First Pick Postal'],
                            lnglat: firstLngLat,
                        }
                    })

                    if (firstLocationWasCreated == true) {

                        await firstLocation.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [customerLocation, clWasCreated] = await CustomerLocation.findOrCreate({
                        where: {
                            locationId: firstLocation.id,
                            customerId: customer.id
                        }
                    })

                    const [secondLocation, secondLocationWasCreated] = await Location.findOrCreate({
                        where: {
                            address: secondAddress,
                            city: json['Last Drop City'],
                            state: json['Last Drop State'],
                            zipcode: json['Last Drop Postal'],
                            lnglat: secondLngLat,
                        }
                    })

                    if (secondLocationWasCreated == true) {

                        await secondLocation.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [secondCustomerLocation, secondClWasCreated] = await CustomerLocation.findOrCreate({
                        where: {
                            locationId: secondLocation.id,
                            customerId: customer.id
                        }
                    })

                    const route = await getRoute(firstLngLat, secondLngLat)

                    const [lane, laneWasCreated] = await Lane.findOrCreate({
                        where: {
                            originLocationId: firstLocation.id,
                            destinationLocationId: secondLocation.id,
                            routeGeometry: route
                        }
                    })

                    const [carrier, carrierWasCreated] = await Carrier.findOrCreate({
                        where: {
                            name: json['Carrier']
                        }
                    })

                    const newLoad = await Load.create({
                        loadId: json['Load ID'],
                        laneId: lane.id,
                        carrierId: carrier.id,
                        rate: json['Flat Rate i'],
                        dropDate: dropDate
                    })

                    const frequency = await getFrequency(lane)
                    lane.frequency = frequency
                    await lane.save()

                    console.log(newLoad.toJSON())
                }

                else if (await firstPickIsCustomer(json)) {

                    console.log('First Pick Load')

                    const [customer, wasCreated] = await Customer.findOrCreate({
                        where: {
                            name: json.Customer,
                            teamId: user.teamId,
                        },
                    })

                    if (wasCreated == true) {

                        await customer.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [firstLocation, firstLocationWasCreated] = await Location.findOrCreate({
                        where: {
                            address: firstAddress,
                            city: json['First Pick City'],
                            state: json['First Pick State'],
                            zipcode: json['First Pick Postal'],
                            lnglat: firstLngLat,
                        }
                    })

                    if (firstLocationWasCreated == true) {

                        await firstLocation.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [customerLocation, clWasCreated] = await CustomerLocation.findOrCreate({
                        where: {
                            locationId: firstLocation.id,
                            customerId: customer.id
                        }
                    })

                    const [secondLocation, secondLocationWasCreated] = await Location.findOrCreate({
                        where: {
                            address: secondAddress,
                            city: json['Last Drop City'],
                            state: json['Last Drop State'],
                            zipcode: json['Last Drop Postal'],
                            lnglat: secondLngLat,
                        }
                    })

                    if (secondLocationWasCreated == true) {

                        await secondLocation.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [lanePartner, lPWasCreated] = await LanePartner.findOrCreate({
                        where: {
                            locationId: secondLocation.id,
                            name: json['Last Drop Name']
                        }
                    })

                    const route = await getRoute(firstLngLat, secondLngLat)

                    const [lane, laneWasCreated] = await Lane.findOrCreate({
                        where: {
                            originLocationId: firstLocation.id,
                            destinationLocationId: secondLocation.id,
                            routeGeometry: route
                        }
                    })

                    const [carrier, carrierWasCreated] = await Carrier.findOrCreate({
                        where: {
                            name: json['Carrier']
                        }
                    })

                    const newLoad = await Load.create({
                        loadId: json['Load ID'],
                        laneId: lane.id,
                        carrierId: carrier.id,
                        rate: json['Flat Rate i'],
                        dropDate: dropDate
                    })

                    const frequency = await getFrequency(lane)
                    lane.frequency = frequency
                    await lane.save()

                    console.log(newLoad.toJSON())
                }

                else if (await lastDropIsCustomer(json)) {

                    console.log('last drop lane: ', json['Load ID'])

                    const [customer, wasCreated] = await Customer.findOrCreate({
                        where: {
                            name: json.Customer,
                            teamId: user.teamId,
                        },
                    })

                    if (wasCreated == true) {

                        await customer.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [firstLocation, firstLocationWasCreated] = await Location.findOrCreate({
                        where: {
                            address: firstAddress,
                            city: json['First Pick City'],
                            state: json['First Pick State'],
                            zipcode: json['First Pick Postal'],
                            lnglat: firstLngLat,
                        }
                    })

                    if (firstLocationWasCreated == true) {

                        await firstLocation.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [lanePartner, lPWasCreated] = await LanePartner.findOrCreate({
                        where: {
                            locationId: firstLocation.id,
                            name: json['First Pick Name']
                        }
                    })

                    const [secondLocation, secondLocationWasCreated] = await Location.findOrCreate({
                        where: {
                            address: secondAddress,
                            city: json['Last Drop City'],
                            state: json['Last Drop State'],
                            zipcode: json['Last Drop Postal'],
                            lnglat: secondLngLat,
                        }
                    })

                    if (secondLocationWasCreated == true) {

                        await secondLocation.createLedger({
                            brokerageId: user.brokerageId
                        })
                    }

                    const [customerLocation, clWasCreated] = await CustomerLocation.findOrCreate({
                        where: {
                            locationId: secondLocation.id,
                            customerId: customer.id
                        }
                    })

                    const route = await getRoute(firstLngLat, secondLngLat)

                    const [lane, laneWasCreated] = await Lane.findOrCreate({
                        where: {
                            originLocationId: firstLocation.id,
                            destinationLocationId: secondLocation.id,
                            routeGeometry: route
                        }
                    })

                    const [carrier, carrierWasCreated] = await Carrier.findOrCreate({
                        where: {
                            name: json['Carrier']
                        }
                    })

                    const newLoad = await Load.create({
                        loadId: json['Load ID'],
                        laneId: lane.id,
                        carrierId: carrier.id,
                        rate: json['Flat Rate i'],
                        dropDate: dropDate
                    })

                    const frequency = await getFrequency(lane)
                    lane.frequency = frequency
                    await lane.save()

                    console.log(newLoad.toJSON())
                }

                else { //customer matching is not possible; return to user to assign
                    console.log("unmatched load", json['Load ID'])
                    unmatchedLanes.push(json)
                }
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(unmatchedLanes)
        }

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }
}




// module.exports.customerUpload = async (event, context) => {

//     const customerCsv = await csv().fromFile('./customer.csv')

//     for (const row of customerCsv) {

//         const user = await getCurrentUser(event.headers.Authorization)

//         const existingCustomer = await Customer.findOne({
//             where: {
//                 name: row['name']
//             }
//         })

//         if (existingCustomer == null) {

//             const customer = await Customer.create({
//                 name: row.name,
//                 teamId: user.teamId,
//                 Ledger: {
//                     brokerageId: user.brokerageId
//                 }
//             }, {
//                 include: Ledger
//             })

//             // const address = row['block_address']
//             const streetAddress = address.split('\n')[0]
//             const cityStateZip = address.split('\n')[1]
//             const city = cityStateZip.split(',')[0]
//             const state = cityStateZip.split(',')[1].split(' ')[0]
//             const zip = cityStateZip.split(',')[1].split(' ')[2]
//             const firstName = row['contactName'].split(' ')[0]
//             const lastName = row['contactName'].split(' ')[1]
//             const lngLat = await getLngLat(row['block_address'])

//             const newLocation = await CustomerLocation.create({
//                 customerId: customer.id,
//                 address: streetAddress,
//                 city: city,
//                 state: state,
//                 zipcode: zip,
//                 lnglat: lngLat,
//                 isHQ: true,
//                 Ledger: {
//                     brokerageId: user.brokerageId
//                 },
//                 CustomerContact: {
//                     firstName: firstName,
//                     lastName: lastName,
//                     phone: row['contactPhone'],
//                     email: row['contactEmail'],
//                     title: 'HQ contact',
//                     contactLevel: 1
//                 }
//             }, {
//                 include: [Ledger, CustomerContact]
//             })

//             console.log('New HQ from new customer: ', newLocation.toJSON())

//         } else {

//             // const address = row['block_address']
//             const streetAddress = address.split('\n')[0]

//             const existingLocation = await CustomerLocation.findOne({
//                 where: {
//                     address: streetAddress
//                 }
//             })

//             console.log('An existing customer hq from the customer csv: ', existingLocation.toJSON())

//             if (existingLocation == null) {

//                 // const address = row['block_address']
//                 const streetAddress = address.split('\n')[0]
//                 const cityStateZip = address.split('\n')[1]
//                 const city = cityStateZip.split(',')[0]
//                 const state = cityStateZip.split(',')[1].split(' ')[0]
//                 const zip = cityStateZip.split(',')[1].split(' ')[2]
//                 const firstName = row['contactName'].split(' ')[0]
//                 const lastName = row['contactName'].split(' ')[1]
//                 const lngLat = await getLngLat(row['block_address'])

//                 const newLocation = await CustomerLocation.create({
//                     customerId: exisitngCustomer.id,
//                     address: streetAddress,
//                     city: city,
//                     state: state,
//                     zipcode: zip,
//                     lnglat: lngLat,
//                     isHQ: true,
//                     Ledger: {
//                         brokerageId: user.brokerageId
//                     },
//                     CustomerContact: {
//                         firstName: firstName,
//                         lastName: lastName,
//                         phone: row['contactPhone'],
//                         email: row['contactEmail'],
//                         title: 'HQ contact',
//                         contactLevel: 1
//                     }
//                 }, {
//                     include: [Ledger, CustomerContact]
//                 })

//                 console.log('New HQ From Existing Customer: ', newLocation.toJSON())

//             } else {

//                 console.log('An existing customer hq from the customer csv: ', existingLocation.toJSON())

//                 existingLocation.isHQ = true

//                 await existingLocation.save()

//                 console.log('Saved as HQ now: ', existingLocation.toJSON())

//             }
//         }
//     }

// }