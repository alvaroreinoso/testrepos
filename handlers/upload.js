const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('.././models');
const { newLoad, newCustomer, newLane, createLane, currentCustomer, getLngLat, getRoute, newCarrier, getLane, getDropDate } = require('.././helpers/csvDump/ascend')
const csv = require('csvtojson')
const getCurrentUser = require('.././helpers/user').getCurrentUser

module.exports.ascendDump = async (event, context) => {

    const jsonArray = await csv().fromString(event.body)

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {

        for (const json of jsonArray) {

            if (await newLoad(json)) {

                if (await newCustomer(json)) { // NEW CUSTOMER

                    const customer = await Customer.create({
                        name: json.Customer,
                        teamId: user.teamId,
                        Ledger: {
                            brokerageId: user.brokerageId
                        }
                    }, {
                        include: Ledger
                    })

                    const cLlngLat = await getLngLat(json['First Pick Address'])

                    const newLocation = await CustomerLocation.create({
                        customerId: customer.id,
                        address: json['First Pick Address'],
                        city: json['First Pick City'],
                        state: json['First Pick State'],
                        zipcode: json['First Pick Postal'],
                        lnglat: cLlngLat
                    })

                    const newLane = await createLane(json)

                    const lPlngLat = await getLngLat(json['Last Drop Address'])
                    const route = await getRoute(cLlngLat, lPlngLat)

                    const newCustLane = await CustomerLane.create({
                        customerLocationId: newLocation.id,
                        laneId: newLane.id,
                        routeGeometry: route,
                        LanePartner: {
                            name: json['Last Drop Name'],
                            address: json['Last Drop Address'],
                            city: json['Last Drop City'],
                            state: json['Last Drop State'],
                            zipcode: json['Last Drop Postal'],
                            lnglat: lPlngLat,
                        },
                    }, {
                        include: LanePartner
                    })

                    if (await newCarrier(json)){ // NEW CARRIER

                        const carrier = await Carrier.create({
                            name: json['Carrier']
                        })

                        const dropDate = await getDropDate(json)

                        console.log(dropDate)

                        const newLoad = await Load.create({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id,
                            carrierId: carrier.id,
                            rate: json['Flat Rate i'],
                            dropDate: dropDate
                        })

                        console.log(newLoad.toJSON())

                    } else { // EXISTING CARRIER

                        const carrier = await Carrier.findOne({
                            where: {
                                name: json['Carrier']
                            }
                        })

                        console.log('Existing Carrier: ', carrier.toJSON())

                        const dropDate = await getDropDate(json)

                        console.log(dropDate)

                        const newLoad = await Load.create({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id,
                            carrierId: carrier.id,
                            rate: json['Flat Rate i'],
                            dropDate: dropDate
                        })

                        console.log(newLoad.toJSON())

                    }

                } else { // EXISTING CUSTOMER

                    const customer = await currentCustomer(json)

                    const existingLocation = await CustomerLocation.findOne({
                        where: {
                            customerId: customer.id,
                            address: json['First Pick Address']
                        }
                    })

                    if (existingLocation == null) { // EXISTING CUSTOMER NEW LOCATION

                        const cLlngLat = await getLngLat(json['First Pick Address'])

                        const newLocation = await CustomerLocation.create({
                            customerId: customer.id,
                            address: json['First Pick Address'],
                            city: json['First Pick City'],
                            state: json['First Pick State'],
                            zipcode: json['First Pick Postal'],
                            lnglat: cLlngLat
                        })

                        if (await newLane(json)) { // EXISTING CUSTOMER NEW LOCATION NEW LANE

                            const newLane = await createLane(json)

                            const lPlngLat = await getLngLat(json['Last Drop Address'])
                            const route = await getRoute(cLlngLat, lPlngLat)

                            const newCustLane = await CustomerLane.create({
                                customerLocationId: newLocation.id,
                                laneId: newLane.id,
                                routeGeometry: route,
                                LanePartner: {
                                    name: json['Last Drop Name'],
                                    address: json['Last Drop Address'],
                                    city: json['Last Drop City'],
                                    state: json['Last Drop State'],
                                    zipcode: json['Last Drop Postal'],
                                    lnglat: lPlngLat,
                                },
                            }, {
                                include: LanePartner
                            })

                            if (await newCarrier(json)){ // NEW CARRIER

                                const carrier = await Carrier.create({
                                    name: json['Carrier']
                                })

                                const dropDate = await getDropDate(json)

                                console.log(dropDate)
        
                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: newCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                console.log(newLoad.toJSON())

                            } else { // EXISTING CARRIER
        
                                const carrier = await Carrier.findOne({
                                    where: {
                                        name: json['Carrier']
                                    }
                                })

                                console.log('Existing Carrier: ', carrier.toJSON())

                                const dropDate = await getDropDate(json)

                                console.log(dropDate)
        
                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: newCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                console.log(newLoad.toJSON())
        
                            }
                        }

                    } else { // EXISTING CUSTOMER EXISTING LOCATION NEW LANE

                        if (await newLane(json)) {

                            const newLane = await createLane(json)

                            const lPlngLat = await getLngLat(json['Last Drop Address'])
                            const route = await getRoute(existingLocation.lnglat, lPlngLat)

                            const newCustLane = await CustomerLane.create({
                                customerLocationId: existingLocation.id,
                                laneId: newLane.id,
                                routeGeometry: route,
                                LanePartner: {
                                    name: json['Last Drop Name'],
                                    address: json['Last Drop Address'],
                                    city: json['Last Drop City'],
                                    state: json['Last Drop State'],
                                    zipcode: json['Last Drop Postal'],
                                    lnglat: lPlngLat,
                                },
                            }, {
                                include: LanePartner
                            })

                            if (await newCarrier(json)){ // NEW CARRIER

                                const carrier = await Carrier.create({
                                    name: json['Carrier']
                                })

                                const dropDate = await getDropDate(json)
        
                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: newCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                console.log(newLoad.toJSON())
                            } else { // EXISTING CARRIER
        
                                const carrier = await Carrier.findOne({
                                    where: {
                                        name: json['Carrier']
                                    }
                                })

                                console.log('Existing Carrier: ', carrier.toJSON())

                                const dropDate = await getDropDate(json)

                                console.log(dropDate)
        
                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: newCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                console.log(newLoad.toJSON())
        
                            }

                        } else {  // EXISTING LANE

                            // FIND CUSTOMER LANE WITH EXISTING LANE ID AS LANE ID AND EXISTING LOCATION ID AS CLOCATIONID

                            const lane = await getLane(json)

                            const existingCustLane = await CustomerLane.findOne({
                                where: {
                                    laneId: lane.id,
                                    customerLocationId: existingLocation.id
                                }
                            })

                            if (await newCarrier(json)){ // NEW CARRIER

                                const carrier = await Carrier.create({
                                    name: json['Carrier']
                                })

                                const dropDate = await getDropDate(json)

                                console.log(dropDate)
        
                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: existingCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                console.log(newLoad.toJSON())
                            } else { // EXISTING CARRIER
        
                                const carrier = await Carrier.findOne({
                                    where: {
                                        name: json['Carrier']
                                    }
                                })

                                console.log('Existing Carrier: ', carrier.toJSON())

                                const dropDate = await getDropDate(json)

                                console.log(dropDate)
        
                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: existingCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                console.log(newLoad.toJSON())
        
                            }

                        }
                    }
                }

            } else {

                console.log('Load Already Added: Load', json['Load ID'])

            }
        }

        return {

            statusCode: 200
        }
    } catch (err) {

        console.log(err)
        return {
            statusCode: 500
        }
    }
}