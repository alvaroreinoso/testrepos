const { Team, CustomerContact, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('.././models');
const { newLoad, newCustomer, newLane, createLane, matchedInternalLane, getOrCreateSecondLocation, currentCustomer, getLngLat, getRoute, newCarrier, getLane, getDropDate, getAddress, getLpAddress } = require('.././helpers/csvDump/ascend')
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

            if (await newLoad(json)) {

                const dropDate = await getDropDate(json)
                const address = await getAddress(json)
                const cLlngLat = await getLngLat(json['First Pick Address'])
                const lPlngLat = await getLngLat(json['Last Drop Address'])

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


                    // NEW CUSTOMER INTERNAL LANE

                    if (await matchedInternalLane(json)) {

                        const firstLocation = await CustomerLocation.create({
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

                        const secondLocation = await getOrCreateSecondLocation(json, customer, address, user, lPlngLat)

                        const route = await getRoute(cLlngLat, lPlngLat)
                        const newLane = await createLane(json)

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: firstLocation.id,
                            secondCustomerLocationId: secondLocation.id,
                            routeGeometry: route,
                            laneId: newLane.id
                        })

                        if (await newCarrier(json)) { // NEW CARRIER

                            const carrier = await Carrier.create({
                                name: json['Carrier']
                            })

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                        } else { // EXISTING CARRIER

                            const carrier = await Carrier.findOne({
                                where: {
                                    name: json['Carrier']
                                }
                            })

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })
                        }

                    }


                    // NEW CUSTOMER MATCH WITH FIRST PICK

                    //determine if customer is first pick or last drop
                    else if (json['First Pick Name'] === customer.name) { //customer is First Pick

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
                        const route = await getRoute(cLlngLat, lPlngLat)
                        const lpAddress = await getLpAddress(json)

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: newLocation.id,
                            laneId: newLane.id,
                            routeGeometry: route,
                            LanePartner: {
                                name: json['Last Drop Name'],
                                address: lpAddress,
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

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                        } else { // EXISTING CARRIER

                            const carrier = await Carrier.findOne({
                                where: {
                                    name: json['Carrier']
                                }
                            })

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })
                        }
                    }

                    // NEW CUSTOMER MATCHED WITH LAST DROP

                    else if (json['Last Drop Name'] === customer.name) { //customer is Last Drop
                        console.log("CUSTOMER IS RECIEVER")

                        const rightAddress = await getLpAddress(json)

                        const newLocation = await CustomerLocation.create({
                            customerId: customer.id,
                            address: lpAddress,
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
                        const route = await getRoute(cLlngLat, lPlngLat)
                        const lpAddress = await getAddress(json)

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: newLocation.id,
                            laneId: newLane.id,
                            routeGeometry: route,
                            LanePartner: {
                                name: json['First Pick Name'],
                                address: lpAddress,
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

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                        } else { // EXISTING CARRIER

                            const carrier = await Carrier.findOne({
                                where: {
                                    name: json['Carrier']
                                }
                            })

                            console.log('Existing Carrier: ', carrier.toJSON())

                            const newLoad = await Load.create({
                                loadId: json['Load ID'],
                                customerLaneId: newCustLane.id,
                                carrierId: carrier.id,
                                rate: json['Flat Rate i'],
                                dropDate: dropDate
                            })

                        }
                    }
                    else { //customer matching is not possible; return to user to assign
                        console.log("unmatched load", json)
                        unmatchedLanes.push(json)
                        return
                    }

                } else { // EXISTING CUSTOMER

                    const customer = await currentCustomer(json)
                    const existingLocation = await CustomerLocation.findOne({
                        where: {
                            customerId: customer.id,
                            address: address
                        }
                    })

                    const lpAddress = await getLpAddress(json)

                    const secondPossibleLoaction = await CustomerLocation.findOne({
                        where: {
                            customerId: customer.id,
                            address: lpAddress
                        }
                    })

                    if (existingLocation == null) { // EXISTING CUSTOMER NEW LOCATION

                        if (await matchedInternalLane(json)) {

                            const firstLocation = await CustomerLocation.create({
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

                            const lpAddress = await getLpAddress(json)

                            const secondLocation = await getOrCreateSecondLocation(json, customer, lpAddress, user, lPlngLat)

                            const route = await getRoute(cLlngLat, lPlngLat)
                            const newLane = await createLane(json)

                            const newCustLane = await CustomerLane.create({
                                customerLocationId: firstLocation.id,
                                secondCustomerLocationId: secondLocation.id,
                                routeGeometry: route,
                                laneId: newLane.id
                            })

                            if (await newCarrier(json)) { // NEW CARRIER

                                const carrier = await Carrier.create({
                                    name: json['Carrier']
                                })

                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: newCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                            } else { // EXISTING CARRIER

                                const carrier = await Carrier.findOne({
                                    where: {
                                        name: json['Carrier']
                                    }
                                })

                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: newCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })
                            }
                        }


                        else if (json['First Pick Name'] === json.Customer) {

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
                                const route = await getRoute(cLlngLat, lPlngLat)
                                const lpAddress = await getLpAddress(json)

                                const newCustLane = await CustomerLane.create({
                                    customerLocationId: newLocation.id,
                                    laneId: newLane.id,
                                    routeGeometry: route,
                                    LanePartner: {
                                        name: json['Last Drop Name'],
                                        address: lpAddress,
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

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                } else { // EXISTING CARRIER

                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
                                }
                            }
                        }

                        else if (json['Last Drop Name'] === json.Customer && secondPossibleLoaction == null) {  /// This needs to be moved

                            console.log('LASt drop name is customer name')

                            const rightAddress = await getLpAddress(json)

                            const newLocation = await CustomerLocation.create({
                                customerId: customer.id,
                                address: rightAddress,
                                city: json['Last Drop City'],
                                state: json['Last Drop State'],
                                zipcode: json['Last Drop Postal'],
                                lnglat: lPlngLat,
                                Ledger: {
                                    brokerageId: user.brokerageId
                                }
                            }, {
                                include: Ledger
                            })

                            if (await newLane(json)) { // EXISTING CUSTOMER NEW LOCATION NEW LANE

                                const newLane = await createLane(json)
                                const route = await getRoute(cLlngLat, lPlngLat)
                                const lpAddress = await getAddress(json)

                                const newCustLane = await CustomerLane.create({
                                    customerLocationId: newLocation.id,
                                    laneId: newLane.id,
                                    routeGeometry: route,
                                    LanePartner: {
                                        name: json['First Pick Name'],
                                        address: lpAddress,
                                        city: json['First Pick City'],
                                        state: json['First Pick State'],
                                        zipcode: json['First Pick Postal'],
                                        lnglat: cLlngLat,
                                    },
                                }, {
                                    include: LanePartner
                                })

                                if (await newCarrier(json)) { // NEW CARRIER

                                    const carrier = await Carrier.create({
                                        name: json['Carrier']
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                } else { // EXISTING CARRIER

                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
                                }
                            }
                        }
                        else {
                            unmatchedLanes.push(json)
                        }

                    } else { // EXISTING CUSTOMER EXISTING LOCATION NEW LANE

                        if (await newLane(json)) {
                            let newCustLane

                            if (await matchedInternalLane(json)) {

                                const firstLocation = existingLocation
                                const lpAddress = await getLpAddress(json)

                                const secondLocation = await getOrCreateSecondLocation(json, customer, lpAddress, user, lPlngLat)

                                const route = await getRoute(cLlngLat, lPlngLat)
                                const newLane = await createLane(json)

                                const newCustLane = await CustomerLane.create({
                                    customerLocationId: firstLocation.id,
                                    secondCustomerLocationId: secondLocation.id,
                                    routeGeometry: route,
                                    laneId: newLane.id
                                })

                                if (await newCarrier(json)) { // NEW CARRIER

                                    const carrier = await Carrier.create({
                                        name: json['Carrier']
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                } else { // EXISTING CARRIER

                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
                                }
                            }


                            else if (json['First Pick Name'] === json.Customer) {

                                const newLane = await createLane(json)
                                const route = await getRoute(existingLocation.lnglat, lPlngLat)
                                const lpAddress = await getLpAddress(json)

                                const newCustLane = await CustomerLane.create({
                                    customerLocationId: existingLocation.id,
                                    laneId: newLane.id,
                                    routeGeometry: route,
                                    LanePartner: {
                                        name: json['Last Drop Name'],
                                        address: lpAddress,
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

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                } else { // EXISTING CARRIER

                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })
                                }
                            }

                            else if (json['Last Drop Name'] === json.Customer) {

                                const newLane = await createLane(json)
                                const route = await getRoute(existingLocation.lnglat, lPlngLat)
                                const lpAddress = await getAddress(json)

                                newCustLane = await CustomerLane.create({
                                    customerLocationId: existingLocation.id,
                                    laneId: newLane.id,
                                    routeGeometry: route,
                                    LanePartner: {
                                        name: json['First Pick Name'],
                                        address: lpAddress,
                                        city: json['First Pick City'],
                                        state: json['First Pick State'],
                                        zipcode: json['First Pick Postal'],
                                        lnglat: cLlngLat,
                                    },
                                }, {
                                    include: LanePartner
                                })

                                if (await newCarrier(json)) { // NEW CARRIER

                                    const carrier = await Carrier.create({
                                        name: json['Carrier']
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                } else { // EXISTING CARRIER

                                    const carrier = await Carrier.findOne({
                                        where: {
                                            name: json['Carrier']
                                        }
                                    })

                                    const newLoad = await Load.create({
                                        loadId: json['Load ID'],
                                        customerLaneId: newCustLane.id,
                                        carrierId: carrier.id,
                                        rate: json['Flat Rate i'],
                                        dropDate: dropDate
                                    })

                                }
                            }
                            else {
                                unmatchedLanes.push(json)
                            }

                        } else {  // EXISTING LANE

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

                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: existingCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })

                            } else { // EXISTING CARRIER

                                const carrier = await Carrier.findOne({
                                    where: {
                                        name: json['Carrier']
                                    }
                                })

                                const newLoad = await Load.create({
                                    loadId: json['Load ID'],
                                    customerLaneId: existingCustLane.id,
                                    carrierId: carrier.id,
                                    rate: json['Flat Rate i'],
                                    dropDate: dropDate
                                })
                            }
                        }
                    }
                }

            } else {

                console.log('Load Already Added: Load', json['Load ID'])

            }
        }

        // console.log("unmatched lanes", unmatchedLanes)

        unmatchedLanes.forEach(x => console.log(x['Load ID']))
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

            // const address = row['block_address']
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

            // const address = row['block_address']
            const streetAddress = address.split('\n')[0]

            const existingLocation = await CustomerLocation.findOne({
                where: {
                    address: streetAddress
                }
            })

            console.log('An existing customer hq from the customer csv: ', existingLocation.toJSON())

            if (existingLocation == null) {

                // const address = row['block_address']
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