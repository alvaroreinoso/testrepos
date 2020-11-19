const { Team, CustomerContact, Endpoint, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('.././models');
const { newLoad, newCustomer, newLane, firstPickIsCustomer, createLane, matchedInternalLane, getOrCreateSecondLocation, currentCustomer, getLngLat, getRoute, newCarrier, getLane, getDropDate, getAddress, getLpAddress, getOriginAndDestination } = require('.././helpers/csvDump/ascend')
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

    const unmatchedLanes = []

    for (const json of jsonArray) {

        if (await newLoad(json)) {

            if (await matchedInternalLane(json)) {

                console.log('match lane')
                
                const firstAddress = await getAddress(json)
                const firstLngLat = await getLngLat(json['First Pick Address'])

                const secondAddress = await getLpAddress(json)
                const secondLngLat = await getLngLat(json['Last Drop Address'])

                console.log(json['Last Drop Date'])

                const dropDate = await getDropDate(json)

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

                const [firstLocation, firstLocationWasCreated] = await CustomerLocation.findOrCreate({
                    where: {
                        customerId: customer.id,
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

                const [secondLocation, secondLocationWasCreated] = await CustomerLocation.findOrCreate({
                    where: {
                        customerId: customer.id,
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

                const [origin, destination] = await getOriginAndDestination(json)

                const lane = await Lane.findOrCreate({
                    where: {
                        origin: origin,
                        destination: destination
                    }
                })

                const route = await getRoute(firstLngLat, secondLngLat)

                const customerLane = await CustomerLane.findOrCreate({
                    where: {
                    routeGeometry: route,
                    laneId: lane.id
                    }
                })

                const endpoint = await Endpoint.findOrCreate({
                    customerLaneId: customerLane.id,
                    customerLocationId: firstLocation.id
                })

                const secondEndpoint = await Endpoint.findOrCreate({
                    customerLaneId: customerLane.id,
                    customerLocationId: secondLocation.id
                })

                const carrier = await Carrier.findOrCreate({
                    name: json['Carrier']
                })

                await Load.create({
                    loadId: json['Load ID'],
                    customerLaneId: customerLane.id,
                    carrierId: carrier.id,
                    rate: json['Flat Rate i'],
                    dropDate: dropDate
                })

                console.log(Load.toJSON())

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

                    console.log('just created', customer)

                    await customer.createLedger({
                        brokerageId: user.brokerageId
                    })
                }
            
                console.log('first pick lane: ', json['Load ID'])
            }

            else if (json['Last Drop Name'] == json.Customer) {


                const [customer, wasCreated] = await Customer.findOrCreate({
                    where: {
                    name: json.Customer,
                    teamId: user.teamId,
                    },
                })

                if (wasCreated == true) {

                    console.log('just created', customer)

                    await customer.createLedger({
                        brokerageId: user.brokerageId
                    })
                }

                console.log('last drop lane: ', json['Load ID'])
            }

            // else unmatched

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
}
}


// module.exports.oldAscendDump = async (event, context) => {

//     const jsonArray = await csv().fromString(event.body)

//     const user = await getCurrentUser(event.headers.Authorization)

//     if (user.id == null) {
//         return {
//             statusCode: 401
//         }
//     }

//     try {
//         const unmatchedLanes = [] //if Customer cannot be matched, push load to this array
//         let i = 0

//         for (const json of jsonArray) {

//             if (json['Last Drop Name'] == json.Customer) {

//                 console.log('Last Drop Match')
//             }

//             i++
//             console.log(i)

//             if (await newLoad(json)) {

//                 const dropDate = await getDropDate(json)
//                 const address = await getAddress(json)
//                 const cLlngLat = await getLngLat(json['First Pick Address'])
//                 const lPlngLat = await getLngLat(json['Last Drop Address'])

//                 if (await newCustomer(json)) { // NEW CUSTOMER

//                     const customer = await Customer.create({
//                         name: json.Customer,
//                         teamId: user.teamId,
//                         Ledger: {
//                             brokerageId: user.brokerageId
//                         }
//                     }, {
//                         include: Ledger
//                     })


//                     // NEW CUSTOMER INTERNAL LANE

//                     if (await matchedInternalLane(json)) {

//                         console.log('matched lane')

//                         const firstLocation = await CustomerLocation.create({
//                             customerId: customer.id,
//                             address: address,
//                             city: json['First Pick City'],
//                             state: json['First Pick State'],
//                             zipcode: json['First Pick Postal'],
//                             lnglat: cLlngLat,
//                             Ledger: {
//                                 brokerageId: user.brokerageId
//                             }
//                         }, {
//                             include: Ledger
//                         })

//                         const secondLocation = await getOrCreateSecondLocation(json, customer, address, user, lPlngLat)

//                         const route = await getRoute(cLlngLat, lPlngLat)
//                         const newLane = await createLane(json)

//                         const newCustLane = await CustomerLane.create({
//                             routeGeometry: route,
//                             laneId: newLane.id
//                         })

//                         const endpoint = await Endpoint.create({
//                             customerLaneId: newCustLane.id,
//                             customerLocationId: firstLocation.id
//                         })

//                         const secondEndpoint = await Endpoint.create({
//                             customerLaneId: newCustLane.id,
//                             customerLocationId: secondLocation.id
//                         })

//                         if (await newCarrier(json)) { // NEW CARRIER

//                             const carrier = await Carrier.create({
//                                 name: json['Carrier']
//                             })

//                             const newLoad = await Load.create({
//                                 loadId: json['Load ID'],
//                                 customerLaneId: newCustLane.id,
//                                 carrierId: carrier.id,
//                                 rate: json['Flat Rate i'],
//                                 dropDate: dropDate
//                             })

//                         } else { // EXISTING CARRIER

//                             const carrier = await Carrier.findOne({
//                                 where: {
//                                     name: json['Carrier']
//                                 }
//                             })

//                             const newLoad = await Load.create({
//                                 loadId: json['Load ID'],
//                                 customerLaneId: newCustLane.id,
//                                 carrierId: carrier.id,
//                                 rate: json['Flat Rate i'],
//                                 dropDate: dropDate
//                             })
//                         }

//                     }


//                     // NEW CUSTOMER MATCH WITH FIRST PICK

//                     //determine if customer is first pick or last drop
//                     else if (json['First Pick Name'] == customer.name) { //customer is First Pick

//                         console.log('first pick load')
//                         const newLocation = await CustomerLocation.create({
//                             customerId: customer.id,
//                             address: address,
//                             city: json['First Pick City'],
//                             state: json['First Pick State'],
//                             zipcode: json['First Pick Postal'],
//                             lnglat: cLlngLat,
//                             Ledger: {
//                                 brokerageId: user.brokerageId
//                             }
//                         }, {
//                             include: Ledger
//                         })

//                         const newLane = await createLane(json)
//                         const route = await getRoute(cLlngLat, lPlngLat)
//                         const lpAddress = await getLpAddress(json)

//                         const newCustLane = await CustomerLane.create({
//                             laneId: newLane.id,
//                             routeGeometry: route,
//                             LanePartner: {
//                                 name: json['Last Drop Name'],
//                                 address: lpAddress,
//                                 city: json['Last Drop City'],
//                                 state: json['Last Drop State'],
//                                 zipcode: json['Last Drop Postal'],
//                                 lnglat: lPlngLat,
//                             },
//                         }, {
//                             include: LanePartner
//                         })

//                         const endpoint = await Endpoint.create({
//                             customerLaneId: newCustLane.id,
//                             customerLocationId: newLocation.id
//                         })

//                         if (await newCarrier(json)) { // NEW CARRIER

//                             const carrier = await Carrier.create({
//                                 name: json['Carrier']
//                             })

//                             const newLoad = await Load.create({
//                                 loadId: json['Load ID'],
//                                 customerLaneId: newCustLane.id,
//                                 carrierId: carrier.id,
//                                 rate: json['Flat Rate i'],
//                                 dropDate: dropDate
//                             })

//                         } else { // EXISTING CARRIER

//                             const carrier = await Carrier.findOne({
//                                 where: {
//                                     name: json['Carrier']
//                                 }
//                             })

//                             const newLoad = await Load.create({
//                                 loadId: json['Load ID'],
//                                 customerLaneId: newCustLane.id,
//                                 carrierId: carrier.id,
//                                 rate: json['Flat Rate i'],
//                                 dropDate: dropDate
//                             })
//                         }
//                     }

//                     // NEW CUSTOMER MATCHED WITH LAST DROP

//                     else if (json['Last Drop Name'] == customer.name) { //customer is Last Drop

//                         console.log('made it here')

//                         console.log("CUSTOMER IS RECIEVER")

//                         const rightAddress = await getLpAddress(json)

//                         const newLocation = await CustomerLocation.create({
//                             customerId: customer.id,
//                             address: lpAddress,
//                             city: json['Last Drop City'],
//                             state: json['Last Drop State'],
//                             zipcode: json['Last Drop Postal'],
//                             lnglat: cLlngLat,
//                             Ledger: {
//                                 brokerageId: user.brokerageId
//                             }
//                         }, {
//                             include: Ledger
//                         })

//                         const newLane = await createLane(json)
//                         const route = await getRoute(cLlngLat, lPlngLat)
//                         const lpAddress = await getAddress(json)

//                         const newCustLane = await CustomerLane.create({
//                             laneId: newLane.id,
//                             routeGeometry: route,
//                             LanePartner: {
//                                 name: json['First Pick Name'],
//                                 address: lpAddress,
//                                 city: json['First Pick City'],
//                                 state: json['First Pick State'],
//                                 zipcode: json['First Pick Postal'],
//                                 lnglat: lPlngLat,
//                             },
//                         }, {
//                             include: LanePartner
//                         })

//                         const endpoint = await Endpoint.create({
//                             customerLaneId: newCustLane.id,
//                             customerLocationId: newLocation.id
//                         })

//                         if (await newCarrier(json)) { // NEW CARRIER

//                             const carrier = await Carrier.create({
//                                 name: json['Carrier']
//                             })

//                             const newLoad = await Load.create({
//                                 loadId: json['Load ID'],
//                                 customerLaneId: newCustLane.id,
//                                 carrierId: carrier.id,
//                                 rate: json['Flat Rate i'],
//                                 dropDate: dropDate
//                             })

//                         } else { // EXISTING CARRIER

//                             const carrier = await Carrier.findOne({
//                                 where: {
//                                     name: json['Carrier']
//                                 }
//                             })

//                             const newLoad = await Load.create({
//                                 loadId: json['Load ID'],
//                                 customerLaneId: newCustLane.id,
//                                 carrierId: carrier.id,
//                                 rate: json['Flat Rate i'],
//                                 dropDate: dropDate
//                             })
//                         }
//                     }
//                     else { //customer matching is not possible; return to user to assign
//                         console.log("unmatched load", json)
//                         unmatchedLanes.push(json)
//                         return
//                     }

//                 } else { // EXISTING CUSTOMER

//                     const customer = await currentCustomer(json)
//                     const existingLocation = await CustomerLocation.findOne({
//                         where: {
//                             customerId: customer.id,
//                             address: address
//                         }
//                     })

//                     const lpAddress = await getLpAddress(json)

//                     const secondPossibleLocation = await CustomerLocation.findOne({
//                         where: {
//                             customerId: customer.id,
//                             address: lpAddress
//                         }
//                     })

//                     if (json['Last Drop Name'] == json.Customer && secondPossibleLocation == null) { // EXISTING CUSTOMER NEW LOCATION

//                         console.log('Made it here')

//                         const rightAddress = await getLpAddress(json)
                        

//                             const newLocation = await CustomerLocation.create({
//                                 customerId: customer.id,
//                                 address: rightAddress,
//                                 city: json['Last Drop City'],
//                                 state: json['Last Drop State'],
//                                 zipcode: json['Last Drop Postal'],
//                                 lnglat: lPlngLat,
//                                 Ledger: {
//                                     brokerageId: user.brokerageId
//                                 }
//                             }, {
//                                 include: Ledger
//                             })

//                             const newLane = await createLane(json)
//                             const route = await getRoute(cLlngLat, lPlngLat)
//                             const lpAddress = await getAddress(json)

//                             const lanePartner = await LanePartner.findOrCreate({
//                                 where: {
//                                     name: json['First Pick Name'],
//                                     address: lpAddress,
//                                     city: json['First Pick City'],
//                                     state: json['First Pick State'],
//                                     zipcode: json['First Pick Postal'],
//                                     lnglat: cLlngLat,
//                                 }
//                             })

//                             const newCustLane = await CustomerLane.create({
//                                 laneId: newLane.id,
//                                 routeGeometry: route,
//                                 lanePartnerId: lanePartner.id
//                             })

//                             const endpoint = await Endpoint.create({
//                                 customerLaneId: newCustLane.id,
//                                 customerLocationId: newLocation.id
//                             })

//                             if (await newCarrier(json)) { // NEW CARRIER

//                                 const carrier = await Carrier.create({
//                                     name: json['Carrier']
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: newCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })

//                             } else { // EXISTING CARRIER

//                                 const carrier = await Carrier.findOne({
//                                     where: {
//                                         name: json['Carrier']
//                                     }
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: newCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })
//                             }
//                     }

//                     else if (existingLocation == null) { // EXISTING CUSTOMER NEW LOCATION

//                         if (await matchedInternalLane(json)) {

//                             console.log('matched lane')

//                             const firstLocation = await CustomerLocation.create({
//                                 customerId: customer.id,
//                                 address: address,
//                                 city: json['First Pick City'],
//                                 state: json['First Pick State'],
//                                 zipcode: json['First Pick Postal'],
//                                 lnglat: cLlngLat,
//                                 Ledger: {
//                                     brokerageId: user.brokerageId
//                                 }
//                             }, {
//                                 include: Ledger
//                             })

//                             const lpAddress = await getLpAddress(json)

//                             const secondLocation = await getOrCreateSecondLocation(json, customer, lpAddress, user, lPlngLat)

//                             const route = await getRoute(cLlngLat, lPlngLat)
//                             const newLane = await createLane(json)

//                             const newCustLane = await CustomerLane.create({
//                                 routeGeometry: route,
//                                 laneId: newLane.id
//                             })

//                             const endpoint = await Endpoint.create({
//                                 customerLaneId: newCustLane.id,
//                                 customerLocationId: firstLocation.id
//                             })

//                             const secondEndpoint = await Endpoint.create({
//                                 customerLaneId: newCustLane.id,
//                                 customerLocationId: secondLocation.id
//                             })

//                             if (await newCarrier(json)) { // NEW CARRIER

//                                 const carrier = await Carrier.create({
//                                     name: json['Carrier']
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: newCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })

//                             } else { // EXISTING CARRIER

//                                 const carrier = await Carrier.findOne({
//                                     where: {
//                                         name: json['Carrier']
//                                     }
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: newCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })
//                             }
//                         }

//                         else if (json['First Pick Name'] == json.Customer) {

//                             console.log('first pick load')
//                             const newLocation = await CustomerLocation.create({
//                                 customerId: customer.id,
//                                 address: address,
//                                 city: json['First Pick City'],
//                                 state: json['First Pick State'],
//                                 zipcode: json['First Pick Postal'],
//                                 lnglat: cLlngLat,
//                                 Ledger: {
//                                     brokerageId: user.brokerageId
//                                 }
//                             }, {
//                                 include: Ledger
//                             })

//                             const newLane = await createLane(json)
//                             const route = await getRoute(cLlngLat, lPlngLat)
//                             const lpAddress = await getLpAddress(json)

//                             const newCustLane = await CustomerLane.create({
//                                 laneId: newLane.id,
//                                 routeGeometry: route,
//                                 LanePartner: {
//                                     name: json['Last Drop Name'],
//                                     address: lpAddress,
//                                     city: json['Last Drop City'],
//                                     state: json['Last Drop State'],
//                                     zipcode: json['Last Drop Postal'],
//                                     lnglat: lPlngLat,
//                                 },
//                             }, {
//                                 include: LanePartner
//                             })

//                             const endpoint = await Endpoint.create({
//                                 customerLaneId: newCustLane.id,
//                                 customerLocationId: newLocation.id
//                             })

//                             if (await newCarrier(json)) { // NEW CARRIER

//                                 const carrier = await Carrier.create({
//                                     name: json['Carrier']
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: newCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })

//                             } else { // EXISTING CARRIER

//                                 const carrier = await Carrier.findOne({
//                                     where: {
//                                         name: json['Carrier']
//                                     }
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: newCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })
//                             }

//                         }

//                         // else if (json['Last Drop Name'] == json.Customer && secondPossibleLocation == null) { // EXISTING CUSTOMER NEW LOCATION

//                         //     console.log('Made it here')

//                         //     const rightAddress = await getLpAddress(json)
                            

//                         //         const newLocation = await CustomerLocation.create({
//                         //             customerId: customer.id,
//                         //             address: rightAddress,
//                         //             city: json['Last Drop City'],
//                         //             state: json['Last Drop State'],
//                         //             zipcode: json['Last Drop Postal'],
//                         //             lnglat: lPlngLat,
//                         //             Ledger: {
//                         //                 brokerageId: user.brokerageId
//                         //             }
//                         //         }, {
//                         //             include: Ledger
//                         //         })

//                         //         const newLane = await createLane(json)
//                         //         const route = await getRoute(cLlngLat, lPlngLat)
//                         //         const lpAddress = await getAddress(json)

//                         //         const lanePartner = await LanePartner.findOrCreate({
//                         //             where: {
//                         //                 name: json['First Pick Name'],
//                         //                 address: lpAddress,
//                         //                 city: json['First Pick City'],
//                         //                 state: json['First Pick State'],
//                         //                 zipcode: json['First Pick Postal'],
//                         //                 lnglat: cLlngLat,
//                         //             }
//                         //         })

//                         //         const newCustLane = await CustomerLane.create({
//                         //             laneId: newLane.id,
//                         //             routeGeometry: route,
//                         //             lanePartnerId: lanePartner.id
//                         //         })

//                         //         const endpoint = await Endpoint.create({
//                         //             customerLaneId: newCustLane.id,
//                         //             customerLocationId: newLocation.id
//                         //         })

//                         //         if (await newCarrier(json)) { // NEW CARRIER

//                         //             const carrier = await Carrier.create({
//                         //                 name: json['Carrier']
//                         //             })

//                         //             const newLoad = await Load.create({
//                         //                 loadId: json['Load ID'],
//                         //                 customerLaneId: newCustLane.id,
//                         //                 carrierId: carrier.id,
//                         //                 rate: json['Flat Rate i'],
//                         //                 dropDate: dropDate
//                         //             })

//                         //         } else { // EXISTING CARRIER

//                         //             const carrier = await Carrier.findOne({
//                         //                 where: {
//                         //                     name: json['Carrier']
//                         //                 }
//                         //             })

//                         //             const newLoad = await Load.create({
//                         //                 loadId: json['Load ID'],
//                         //                 customerLaneId: newCustLane.id,
//                         //                 carrierId: carrier.id,
//                         //                 rate: json['Flat Rate i'],
//                         //                 dropDate: dropDate
//                         //             })
//                         //         }
//                         }
//                         else {
//                             unmatchedLanes.push(json)
//                         }
//                     }
//                     } 

                    
//                     else { // EXISTING CUSTOMER EXISTING LOCATION NEW LANE

//                         if (await newLane(json)) {

//                             if (await matchedInternalLane(json)) {

//                                 console.log('matched lane')
//                                 const firstLocation = existingLocation
//                                 const lpAddress = await getLpAddress(json)

//                                 const secondLocation = await getOrCreateSecondLocation(json, customer, lpAddress, user, lPlngLat)

//                                 const route = await getRoute(cLlngLat, lPlngLat)
//                                 const newLane = await createLane(json)

//                                 const newCustLane = await CustomerLane.create({
//                                     routeGeometry: route,
//                                     laneId: newLane.id
//                                 })

//                                 const endpoint = await Endpoint.create({
//                                     customerLaneId: newCustLane.id,
//                                     customerLocationId: firstLocation.id
//                                 })

//                                 const secondEndpoint = await Endpoint.create({
//                                     customerLaneId: newCustLane.id,
//                                     customerLocationId: secondLocation.id
//                                 })

//                                 if (await newCarrier(json)) { // NEW CARRIER

//                                     const carrier = await Carrier.create({
//                                         name: json['Carrier']
//                                     })

//                                     const newLoad = await Load.create({
//                                         loadId: json['Load ID'],
//                                         customerLaneId: newCustLane.id,
//                                         carrierId: carrier.id,
//                                         rate: json['Flat Rate i'],
//                                         dropDate: dropDate
//                                     })

//                                 } else { // EXISTING CARRIER

//                                     const carrier = await Carrier.findOne({
//                                         where: {
//                                             name: json['Carrier']
//                                         }
//                                     })

//                                     const newLoad = await Load.create({
//                                         loadId: json['Load ID'],
//                                         customerLaneId: newCustLane.id,
//                                         carrierId: carrier.id,
//                                         rate: json['Flat Rate i'],
//                                         dropDate: dropDate
//                                     })
//                                 }
//                             }


//                             else if (json['First Pick Name'] == json.Customer) {

//                                 console.log('first pick load')

//                                 const newLane = await createLane(json)
//                                 const route = await getRoute(existingLocation.lnglat, lPlngLat)
//                                 const lpAddress = await getLpAddress(json)

//                                 const newCustLane = await CustomerLane.create({
//                                     laneId: newLane.id,
//                                     routeGeometry: route,
//                                     LanePartner: {
//                                         name: json['Last Drop Name'],
//                                         address: lpAddress,
//                                         city: json['Last Drop City'],
//                                         state: json['Last Drop State'],
//                                         zipcode: json['Last Drop Postal'],
//                                         lnglat: lPlngLat,
//                                     },
//                                 }, {
//                                     include: LanePartner
//                                 })

//                                 const endpoint = await Endpoint.create({
//                                     customerLaneId: newCustLane.id,
//                                     customerLocationId: existingLocation.id
//                                 })

//                                 if (await newCarrier(json)) { // NEW CARRIER

//                                     const carrier = await Carrier.create({
//                                         name: json['Carrier']
//                                     })

//                                     const newLoad = await Load.create({
//                                         loadId: json['Load ID'],
//                                         customerLaneId: newCustLane.id,
//                                         carrierId: carrier.id,
//                                         rate: json['Flat Rate i'],
//                                         dropDate: dropDate
//                                     })

//                                 } else { // EXISTING CARRIER

//                                     const carrier = await Carrier.findOne({
//                                         where: {
//                                             name: json['Carrier']
//                                         }
//                                     })

//                                     const newLoad = await Load.create({
//                                         loadId: json['Load ID'],
//                                         customerLaneId: newCustLane.id,
//                                         carrierId: carrier.id,
//                                         rate: json['Flat Rate i'],
//                                         dropDate: dropDate
//                                     })
//                                 }
//                             }

//                             else if (json['Last Drop Name'] == json.Customer) {


//                                 console.log('made it here')

//                                 const newLane = await createLane(json)
//                                 const route = await getRoute(existingLocation.lnglat, lPlngLat)
//                                 const lpAddress = await getAddress(json)

//                                 const newCustLane = await CustomerLane.create({
//                                     laneId: newLane.id,
//                                     routeGeometry: route,
//                                     LanePartner: {
//                                         name: json['First Pick Name'],
//                                         address: lpAddress,
//                                         city: json['First Pick City'],
//                                         state: json['First Pick State'],
//                                         zipcode: json['First Pick Postal'],
//                                         lnglat: cLlngLat,
//                                     },
//                                 }, {
//                                     include: LanePartner
//                                 })

//                                 // TODO fix location used to be the second location

//                                 const endpoint = await Endpoint.create({
//                                     customerLaneId: newCustLane.id,
//                                     customerLocationId: existingLocation.id
//                                 })

//                                 if (await newCarrier(json)) { // NEW CARRIER

//                                     const carrier = await Carrier.create({
//                                         name: json['Carrier']
//                                     })

//                                     const newLoad = await Load.create({
//                                         loadId: json['Load ID'],
//                                         customerLaneId: newCustLane.id,
//                                         carrierId: carrier.id,
//                                         rate: json['Flat Rate i'],
//                                         dropDate: dropDate
//                                     })

//                                 } else { // EXISTING CARRIER

//                                     const carrier = await Carrier.findOne({
//                                         where: {
//                                             name: json['Carrier']
//                                         }
//                                     })

//                                     const newLoad = await Load.create({
//                                         loadId: json['Load ID'],
//                                         customerLaneId: newCustLane.id,
//                                         carrierId: carrier.id,
//                                         rate: json['Flat Rate i'],
//                                         dropDate: dropDate
//                                     })

//                                 }
//                             }
//                             else {
//                                 unmatchedLanes.push(json)
//                             }

//                         } else {  // EXISTING LANE

//                             const lane = await getLane(json)

//                             const existingCustLane = await CustomerLane.findOne({
//                                 where: {
//                                     laneId: lane.id,
//                                 }
//                             })

//                             if (await newCarrier(json)) { // NEW CARRIER

//                                 const carrier = await Carrier.create({
//                                     name: json['Carrier']
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: existingCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })

//                             } else { // EXISTING CARRIER

//                                 const carrier = await Carrier.findOne({
//                                     where: {
//                                         name: json['Carrier']
//                                     }
//                                 })

//                                 const newLoad = await Load.create({
//                                     loadId: json['Load ID'],
//                                     customerLaneId: existingCustLane.id,
//                                     carrierId: carrier.id,
//                                     rate: json['Flat Rate i'],
//                                     dropDate: dropDate
//                                 })
//                             }
//                         }
//                     }
//                 }

//             } else {

//                 console.log('Load Already Added: Load', json['Load ID'])

//             }
//         }

//         // console.log("unmatched lanes", unmatchedLanes)

//         unmatchedLanes.forEach(x => console.log(x['Load ID']))
//         const response = {
//             statusCode: 200,
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(unmatchedLanes)
//         }
//         return response
//     } catch (err) {

//         console.log(err)
//         return {
//             statusCode: 500
//         }
//     }
// }




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