const csvFilePath = 'clean.csv'
const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner } = require('./models');
const csv = require('csvtojson')

const { newLoad } = require('./helpers/csvDump/ascend')
console.log(newLoad)

async function parseCSV() {

    const jsonArray = await csv().fromFile(csvFilePath);

    for (const json of jsonArray) {

        const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
        const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

        const existingLoad = await Load.findOne({
            where: {
                loadId: json['Load ID']
            }
        })


        if (await newLoad(json)) {
            console.log('New Load From Helper')
        

        // if (existingLoad == null) { // LOAD DOESNT EXIST IN DATABASE

            console.log('New load From OG Query')
            const existingCustomer = await Customer.findOne({
                where: {
                    name: json.Customer
                }
            })

            if (existingCustomer == null) { // NEW CUSTOMER

                // console.log('The Customer did not exist')

                const customer = await Customer.build({
                    name: json.Customer,
                    Ledger: {
                        brokerageId: 1
                    }
                }, {
                    include: Ledger
                })

                await customer.save()

                // console.log('New Customer:', customer.toJSON())

                const existingLocation = await CustomerLocation.findOne({
                    where: {
                        customerId: customer.id,
                        address: json['First Pick Address']
                    }
                })

                if (existingLocation == null) { // NEW CUSTOMER NEW LOCATION

                    const newLocation = await CustomerLocation.build({
                        customerId: customer.id,
                        address: json['First Pick Address'],
                        city: json['First Pick City'],
                        state: json['First Pick State'],
                        zipcode: json['First Pick Postal']
                    })

                    // console.log('New Location: ', newLocation.toJSON())

                    await newLocation.save()

                    const existingLane = await Lane.findOne({
                        where: {
                            origin: jsonOrigin,
                            destination: jsonDestination
                        }
                    })

                    if (existingLane == null) { // NEW CUSTOMER NEW LOCATION NEW LANE

                        const newLane = await Lane.build({
                            origin: jsonOrigin,
                            destination: jsonDestination
                        })

                        await newLane.save()

                        // console.log('New lane: ', newLane)

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: newLocation.id,
                            laneId: newLane.id,
                            LanePartner: {
                                name: json['Last Drop Name'],
                                address: json['Last Drop Address'],
                                city: json['Last Drop City'],
                                state: json['Last Drop State'],
                                zipcode: json['Last Drop Postal']
                            },
                        }, {
                            include: LanePartner
                        })

                        // await newCustLane.save()

                        // console.log('New Lane added: ', newCustLane.toJSON())

                        const newLoad = await Load.build({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                        await newLoad.save()

                        // console.log('New Load added: ', newLoad.toJSON())
                    }

                } else { // NEW CUSTOMER EXISTING LOCATION NEW LANE

                    const existingLane = await Lane.findOne({
                        where: {
                            origin: jsonOrigin,
                            destination: jsonDestination
                        }
                    })

                    if (existingLane == null) {

                        const newLane = await Lane.build({
                            origin: jsonOrigin,
                            destination: jsonDestination
                        })

                        await newLane.save()

                        // console.log('New lane: ', newLane.toJSON())

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: newLocation.id,
                            laneId: newLane.id,
                            LanePartner: {
                                name: json['Last Drop Name'],
                                address: json['Last Drop Address'],
                                city: json['Last Drop City'],
                                state: json['Last Drop State'],
                                zipcode: json['Last Drop Postal']
                            },
                        }, {
                            include: LanePartner
                        })

                        // await newCustLane.save()

                        // console.log('New Lane added: ', newCustLane.toJSON())

                        const newLoad = await Load.build({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                        await newLoad.save()

                        // console.log('New Load added: ', newLoad.toJSON())
                    }

                }

            } else { // EXISTING CUSTOMER

                const existingLocation = await CustomerLocation.findOne({
                    where: {
                        customerId: existingCustomer.id,
                        address: json['First Pick Address']
                    }
                })

                if (existingLocation == null) { // EXISTING CUSTOMER NEW LOCATION

                    const newLocation = await CustomerLocation.build({
                        customerId: existingCustomer.id,
                        address: json['First Pick Address'],
                        city: json['First Pick City'],
                        state: json['First Pick State'],
                        zipcode: json['First Pick Postal']
                    })

                    // console.log('New Location: ', newLocation.toJSON())

                    await newLocation.save()

                    const existingLane = await Lane.findOne({
                        where: {
                            origin: jsonOrigin,
                            destination: jsonDestination
                        }
                    })

                    if (existingLane == null) { // EXISTING CUSTOMER NEW LOCATION NEW LANE

                        const newLane = await Lane.build({
                            origin: jsonOrigin,
                            destination: jsonDestination
                        })

                        await newLane.save()

                        // console.log('New lane: ', newLane.toJSON())

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: newLocation.id,
                            laneId: newLane.id,
                            LanePartner: {
                                name: json['Last Drop Name'],
                                address: json['Last Drop Address'],
                                city: json['Last Drop City'],
                                state: json['Last Drop State'],
                                zipcode: json['Last Drop Postal']
                            },
                        }, {
                            include: LanePartner
                        })

                        // await newCustLane.save()

                        // console.log('New Lane added: ', newCustLane.toJSON())

                        const newLoad = await Load.build({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                        await newLoad.save()

                        // console.log('New Load added: ', newLoad.toJSON())

                    }

                } else { // EXISTING CUSTOMER EXISTING LOCATION NEW LANE

                    const existingLane = await Lane.findOne({
                        where: {
                            origin: jsonOrigin,
                            destination: jsonDestination
                        }
                    })

                    if (existingLane == null) {

                        const newLane = await Lane.build({
                            origin: jsonOrigin,
                            destination: jsonDestination
                        })

                        await newLane.save()

                        // console.log('New lane: ', newLane.toJSON())

                        const newCustLane = await CustomerLane.create({
                            customerLocationId: existingLocation.id,
                            laneId: newLane.id,
                            LanePartner: {
                                name: json['Last Drop Name'],
                                address: json['Last Drop Address'],
                                city: json['Last Drop City'],
                                state: json['Last Drop State'],
                                zipcode: json['Last Drop Postal']
                            },
                        }, {
                            include: LanePartner
                        })

                        // await newCustLane.save()

                        // console.log('New Lane added: ', newCustLane.toJSON())

                        const newLoad = await Load.build({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                        await newLoad.save()

                        // console.log('New Load added: ', newLoad.toJSON())
                    }
                }

            }

        } else {

            console.log('Load Already Added: ', existingLoad.toJSON())

        }

    }
}

parseCSV()