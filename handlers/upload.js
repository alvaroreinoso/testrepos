const { CustomerContact, Location, Load, Customer, CustomerLocation, Lane, LanePartner, Carrier } = require('.././models');
const { newLoad, lastDropIsCustomer, firstPickIsCustomer, matchedInternalLane, getLngLat, getRoute, getDropDate, getAddress, getLpAddress } = require('.././helpers/csvDump/ascend')
const csv = require('csvtojson')
const getCurrentUser = require('.././helpers/user').getCurrentUser
const getFrequency = require('.././helpers/getLoadFrequency').getFrequency

module.exports.ascendLoadsUpload = async (event, context) => {

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

                    console.log('matched internal: ', json['Load ID'])

                    const [customer, customerWasCreated] = await Customer.findOrCreate({
                        where: {
                            name: json.Customer,
                            brokerageId: user.brokerageId,
                        },
                    })

                    if (customerWasCreated) {

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

                    if (firstLocationWasCreated) {

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

                    if (secondLocationWasCreated) {

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

                    // console.log(newLoad.toJSON())
                }

                else if (await firstPickIsCustomer(json)) {

                    console.log('First Pick Load')

                    const [customer, customerWasCreated] = await Customer.findOrCreate({
                        where: {
                            name: json.Customer,
                            brokerageId: user.brokerageId,
                        },
                    })

                    if (customerWasCreated) {

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

                    if (firstLocationWasCreated) {

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

                    if (secondLocationWasCreated) {

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

                    // console.log(newLoad.toJSON())
                }

                else if (await lastDropIsCustomer(json)) {

                    console.log('last drop lane: ', json['Load ID'])

                    const [customer, customerWasCreated] = await Customer.findOrCreate({
                        where: {
                            name: json.Customer,
                            brokerageId: user.brokerageId,
                        },
                    })

                    if (customerWasCreated) {

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

                    if (firstLocationWasCreated) {

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

                    if (secondLocationWasCreated) {

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
                            routeGeometry: route,
                            inbound: true
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

                    // console.log(newLoad.toJSON())
                }

                else {
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




module.exports.ascendCustomerUpload = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const customerCsv = await csv().fromString(event.body)

        for (const row of customerCsv) {

            const [customer, customerWasCreated] = await Customer.findOrCreate({
                where: {
                    name: row['name'],
                    brokerageId: user.brokerageId,
                },
            })

            if (customerWasCreated) {
                await customer.createLedger({
                    brokerageId: user.brokerageId
                })
            }

            const address = row['block_address']
            const streetAddress = address.split('\n')[0]
            const cityStateZip = address.split('\n')[1]
            const city = cityStateZip.split(',')[0]
            const state = cityStateZip.split(',')[1].split(' ')[1]
            const zip = cityStateZip.split(',')[1].split(' ')[2]
            const firstName = row['contactName'].split(' ')[0]
            const lastName = row['contactName'].split(' ')[1]
            const lngLat = await getLngLat(row['block_address'])

            const [location, locationWasCreated] = await Location.findOrCreate({
                where: {
                    address: streetAddress,
                    city: city,
                    state: state,
                    zipcode: zip,
                    lnglat: lngLat,
                }
            })

            if (locationWasCreated) {
                await location.createLedger({
                    brokerageId: user.brokerageId
                })
            }

            const [customerContact, contactWasCreated] = await CustomerContact.findOrCreate({
                where: {
                    firstName: firstName,
                    lastName: lastName,
                    phone: row['contactPhone'],
                    email: row['contactEmail'],
                    title: 'HQ contact',
                    contactLevel: 1
                }
            })

            location.contactId = customerContact.id
            location.isHQ = true
            await location.save()

            const [customerLocation, customerLocationWasCreated] = await CustomerLocation.findOrCreate({
                where: {
                    locationId: location.id,
                    customerId: customer.id
                }
            })
        }
        return {
            statusCode: 204
        }
    } catch (err) {

        console.log(err)
        return {
            statusCode: 500
        }
    }
}