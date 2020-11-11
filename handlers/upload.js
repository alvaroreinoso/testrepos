const { Team, CustomerContact, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('.././models');
const { newLoad, newCustomer, newLane, createLane, currentCustomer, getLngLat, getRoute, newCarrier, getLane, getDropDate, getAddress, internalLane } = require('.././helpers/csvDump/ascend')
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
        const unmatchedLanes = [] //if Customer cannot be matched, push load to this array
        let i = 0

        for (const json of jsonArray) {

            i++
            console.log(i)

            if (await internalLane(json)) {

                // need to create function to see if internal lane 

                console.log('Internal Lane here')


                // Do not save a lane partner

                //
            }
            
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

                    if (await internalLane(json)) {

                        // need to create function to see if internal lane 

                        console.log('Internal Lane here')


                        // Do not save a lane partner

                        //
                    }


                    //CHANGES START HERE
                    //determine if customer is first pick or last drop
                    if (json['First Pick Name'] === customer.name) { //customer is First Pick
                        const cLlngLat = await getLngLat(json['First Pick Address'])

                        const address = await getAddress(json)

                        const newLocation = await CustomerLocation.create({
                            customerId: customer.id,
                            address: address,
                            city: json['First Pick City'],
                            state: json['First Pick State'],
                            zipcode: json['First Pick Postal'],
                            lnglat: cLlngLat,
                            Ledger: {
                                brokerageId: user.brokerageId
                            }
                        }, {
                            include: Ledger
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

                        if (await newCarrier(json)) { // NEW CARRIER

                            const carrier = await Carrier.create({
                                name: json['Carrier']
                            })

                            const dropDate = await getDropDate(json)

                            // console.log(dropDate)

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                            // console.log(newLoad.toJSON())

                        } else { // EXISTING CARRIER

                            const carrier = await Carrier.findOne({
                                where: {
                                    name: json['Carrier']
                                }
                            })

                            // console.log('Existing Carrier: ', carrier.toJSON())

                            const dropDate = await getDropDate(json)

                            // console.log(dropDate)

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                            // console.log(newLoad.toJSON())

                        }
                    }
                    else if (json['Last Drop Name'] === customer.name) { //customer is Last Drop
                        console.log("CUSTOMER IS RECIEVER")
                        const cLlngLat = await getLngLat(json['Last Drop Address'])

                        const address = await getAddress(json)

                        const newLocation = await CustomerLocation.create({
                            customerId: customer.id,
                            address: address,
                            city: json['Last Drop City'],
                            state: json['Last Drop State'],
                            zipcode: json['Last Drop Postal'],
                            lnglat: cLlngLat,
                            Ledger: {
                                brokerageId: user.brokerageId
                            }
                        }, {
                            include: Ledger
                        })

                        const newLane = await createLane(json)

                        const lPlngLat = await getLngLat(json['First Pick Address'])
                        const route = await getRoute(cLlngLat, lPlngLat)

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: newLocation.id,
                            laneId: newLane.id,
                            routeGeometry: route,
                            LanePartner: {
                                name: json['First Pick Name'],
                                address: json['First Pick Address'],
                                city: json['First Pick City'],
                                state: json['First Pick State'],
                                zipcode: json['First Pick Postal'],
                                lnglat: lPlngLat,
                            },
                        }, {
                            include: LanePartner
                        })

                        if (await newCarrier(json)) { // NEW CARRIER

                            const carrier = await Carrier.create({
                                name: json['Carrier']
                            })

                            const dropDate = await getDropDate(json)

                            // console.log(dropDate)

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                            // console.log(newLoad.toJSON())

                        } else { // EXISTING CARRIER

                            const carrier = await Carrier.findOne({
                                where: {
                                    name: json['Carrier']
                                }
                            })

                            console.log('Existing Carrier: ', carrier.toJSON())

                            const dropDate = await getDropDate(json)

                            // console.log(dropDate)

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                            // console.log(newLoad.toJSON())

                        }
                    }
                    else { //customer matching is not possible; return to user to assign
                        console.log("unmatched load", json)
                        unmatchedLanes.push(json)
                        return
                    }

                } else { // EXISTING CUSTOMER

                    const customer = await currentCustomer(json)

                    const address = await getAddress(json)

                    const existingLocation = await CustomerLocation.findOne({
                        where: {
                            customerId: customer.id,
                            address: address
                        }
                    })

                    if (existingLocation == null) { // EXISTING CUSTOMER NEW LOCATION

                        //CHANGES HERE

                        if (json['First Pick Name'] === json.Customer) {
                            const cLlngLat = await getLngLat(json['First Pick Address'])

                            const newLocation = await CustomerLocation.create({
                                customerId: customer.id,
                                address: address,
                                city: json['First Pick City'],
                                state: json['First Pick State'],
                                zipcode: json['First Pick Postal'],
                                lnglat: cLlngLat,
                                Ledger: {
                                    brokerageId: user.brokerageId
                                }
                            }, {
                                include: Ledger
                            })

                            if (await newLane(json)) { // EXISTING CUSTOMER NEW LOCATION NEW LANE

                                const newLane = await createLane(json)
    
                                const lPlngLat = await getLngLat(json['Last Drop Address'])
                                console.log(cLlngLat, lPlngLat)
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
    
                                if (await newCarrier(json)) { // NEW CARRIER
    
                                    const carrier = await Carrier.create({
                                        name: json['Carrier']
                                    })
    
                                    const dropDate = await getDropDate(json)
    
                                    // console.log(dropDate)
    
                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
    
                                    // console.log(newLoad.toJSON())
    
                                } else { // EXISTING CARRIER
    
                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })
    
                                    // console.log('Existing Carrier: ', carrier.toJSON())
    
                                    const dropDate = await getDropDate(json)
    
                                    // console.log(dropDate)
    
                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
    
                                    // console.log(newLoad.toJSON())
    
                                }
                            }
                        }
                        else if (json['Last Drop Name'] === json.Customer) {
                            const cLlngLat = await getLngLat(json['Last Drop Address'])

                            const newLocation = await CustomerLocation.create({
                                customerId: customer.id,
                                address: address,
                                city: json['Last Drop City'],
                                state: json['Last Drop State'],
                                zipcode: json['Last Drop Postal'],
                                lnglat: cLlngLat,
                                Ledger: {
                                    brokerageId: user.brokerageId
                                }
                            }, {
                                include: Ledger
                            })

                            if (await newLane(json)) { // EXISTING CUSTOMER NEW LOCATION NEW LANE

                                const newLane = await createLane(json)
    
                                const lPlngLat = await getLngLat(json['Last Drop Address'])
                                console.log(cLlngLat, lPlngLat)
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
    
                                if (await newCarrier(json)) { // NEW CARRIER
    
                                    const carrier = await Carrier.create({
                                        name: json['Carrier']
                                    })
    
                                    const dropDate = await getDropDate(json)
    
                                    // console.log(dropDate)
    
                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
    
                                    // console.log(newLoad.toJSON())
    
                                } else { // EXISTING CARRIER
    
                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })
    
                                    // console.log('Existing Carrier: ', carrier.toJSON())
    
                                    const dropDate = await getDropDate(json)
    
                                    // console.log(dropDate)
    
                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
    
                                    // console.log(newLoad.toJSON())
    
                                }
                            }
                        }
                        else {
                            console.log("NOOOOO")
                            unmatchedLanes.push(json)
                        }

                    } else { // EXISTING CUSTOMER EXISTING LOCATION NEW LANE

                        if (await newLane(json)) {
                            let newCustLane

                            if (json['First Pick Name'] === json.Customer) {
                                const newLane = await createLane(json)

                                const lPlngLat = await getLngLat(json['Last Drop Address'])
                                const route = await getRoute(existingLocation.lnglat, lPlngLat)

                                newCustLane = await CustomerLane.create({
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

                                if (await newCarrier(json)) { // NEW CARRIER

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

                                    // console.log(newLoad.toJSON())
                                } else { // EXISTING CARRIER

                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })

                                    // console.log('Existing Carrier: ', carrier.toJSON())

                                    const dropDate = await getDropDate(json)

                                    // console.log(dropDate)

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                    // console.log(newLoad.toJSON())

                                }
                            }
                            else if (json['Last Drop Name'] === json.Customer) {
                                const newLane = await createLane(json)

                                const lPlngLat = await getLngLat(json['First Pick Address'])
                                const route = await getRoute(existingLocation.lnglat, lPlngLat)

                                newCustLane = await CustomerLane.create({
                                    customerLocationId: existingLocation.id,
                                    laneId: newLane.id,
                                    routeGeometry: route,
                                    LanePartner: {
                                        name: json['First Pick Name'],
                                        address: json['First Pick Address'],
                                        city: json['First Pick City'],
                                        state: json['First Pick State'],
                                        zipcode: json['First Pick Postal'],
                                        lnglat: lPlngLat,
                                    },
                                }, {
                                    include: LanePartner
                                })

                                if (await newCarrier(json)) { // NEW CARRIER

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

                                    // console.log(newLoad.toJSON())
                                } else { // EXISTING CARRIER

                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })

                                    // console.log('Existing Carrier: ', carrier.toJSON())

                                    const dropDate = await getDropDate(json)

                                    // console.log(dropDate)

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                    // console.log(newLoad.toJSON())

                                }
                            }
                            else {
                                console.log("AHHHHHH")
                                unmatchedLanes.push(json)
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

                            if (await newCarrier(json)) { // NEW CARRIER

                                const carrier = await Carrier.create({
                                    name: json['Carrier']
                                })

                                const dropDate = await getDropDate(json)

                                // console.log(dropDate)

                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: existingCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                // console.log(newLoad.toJSON())
                            } else { // EXISTING CARRIER

                                const carrier = await Carrier.findOne({
                                    where: {
                                        name: json['Carrier']
                                    }
                                })

                                // console.log('Existing Carrier: ', carrier.toJSON())

                                const dropDate = await getDropDate(json)

                                // console.log(dropDate)

                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: existingCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                                // console.log(newLoad.toJSON())

                            }

                        }
                    }
                }

            } else {

                console.log('Load Already Added: Load', json['Load ID'])

            }
        }

        // console.log("unmatched lanes", unmatchedLanes)
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unmatchedLanes)
        }
        return response
    } catch (err) {

        console.log(err)
        return {
            statusCode: 500
        }
    }
}




module.exports.customerUpload = async (event, context) => {

    const customerCsv = await csv().fromFile('./customer.csv')

    for (const row of customerCsv) {

        const user = await getCurrentUser(event.headers.Authorization)

        const existingCustomer = await Customer.findOne({
            where: {
                name: row['name']
            }
        })

        if (existingCustomer == null) {

            const customer = await Customer.create({
                name: row.name,
                teamId: user.teamId,
                Ledger: {
                    brokerageId: user.brokerageId
                }
            }, {
                include: Ledger
            })

            const address = row['block_address']
            const streetAddress = address.split('\n')[0]
            const cityStateZip = address.split('\n')[1]
            const city = cityStateZip.split(',')[0]
            const state = cityStateZip.split(',')[1].split(' ')[0]
            const zip = cityStateZip.split(',')[1].split(' ')[2]
            const firstName = row['contactName'].split(' ')[0]
            const lastName = row['contactName'].split(' ')[1]
            const lngLat = await getLngLat(row['block_address'])

            const newLocation = await CustomerLocation.create({
                customerId: customer.id,
                address: streetAddress,
                city: city,
                state: state,
                zipcode: zip,
                lnglat: lngLat,
                isHQ: true,
                Ledger: {
                    brokerageId: user.brokerageId
                },
                CustomerContact: {
                    firstName: firstName,
                    lastName: lastName,
                    phone: row['contactPhone'],
                    email: row['contactEmail'],
                    title: 'HQ contact',
                    contactLevel: 1
                }
            }, {
                include: [Ledger, CustomerContact]
            })

            console.log('New HQ from new customer: ', newLocation.toJSON())

        } else {

            const address = row['block_address']
            const streetAddress = address.split('\n')[0]

            const existingLocation = await CustomerLocation.findOne({
                where: {
                    address: streetAddress
                }
            })

            console.log('An existing customer hq from the customer csv: ', existingLocation.toJSON())

            if (existingLocation == null) {

                const address = row['block_address']
                const streetAddress = address.split('\n')[0]
                const cityStateZip = address.split('\n')[1]
                const city = cityStateZip.split(',')[0]
                const state = cityStateZip.split(',')[1].split(' ')[0]
                const zip = cityStateZip.split(',')[1].split(' ')[2]
                const firstName = row['contactName'].split(' ')[0]
                const lastName = row['contactName'].split(' ')[1]
                const lngLat = await getLngLat(row['block_address'])

                const newLocation = await CustomerLocation.create({
                    customerId: exisitngCustomer.id,
                    address: streetAddress,
                    city: city,
                    state: state,
                    zipcode: zip,
                    lnglat: lngLat,
                    isHQ: true,
                    Ledger: {
                        brokerageId: user.brokerageId
                    },
                    CustomerContact: {
                        firstName: firstName,
                        lastName: lastName,
                        phone: row['contactPhone'],
                        email: row['contactEmail'],
                        title: 'HQ contact',
                        contactLevel: 1
                    }
                }, {
                    include: [Ledger, CustomerContact]
                })

                console.log('New HQ From Existing Customer: ', newLocation.toJSON())

            } else {

                console.log('An existing customer hq from the customer csv: ', existingLocation.toJSON())

                existingLocation.isHQ = true

                await existingLocation.save()

                console.log('Saved as HQ now: ', existingLocation.toJSON())

            }
        }
    }

}