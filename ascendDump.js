const csvFilePath = 'clean.csv'
const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner } = require('./models');
const csv = require('csvtojson')
const { newLoad, newCustomer, newLane, createLane, currentCustomer } = require('./helpers/csvDump/ascend')


async function parseCSV() {

    const jsonArray = await csv().fromFile(csvFilePath);

    for (const json of jsonArray) {

        if (await newLoad(json)) {

            if (await newCustomer(json)) { // NEW CUSTOMER

                const customer = await Customer.create({
                    name: json.Customer,
                    Ledger: {
                        brokerageId: 1
                    }
                }, {
                    include: Ledger
                })

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

                    if (await newLane(json)) { // NEW CUSTOMER NEW LOCATION NEW LANE

                        const newLane = await createLane(json)

                        console.log('New lane: ', newLane)

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

                        // console.log('New Customer Lane added: ', newCustLane.toJSON())

                        const newLoad = await Load.create({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                        // console.log('New Load added: ', newLoad.toJSON())
                    }

                } else {
                    console.log('this is impossible')
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

                    const newLocation = await CustomerLocation.build({
                        customerId: customer.id,
                        address: json['First Pick Address'],
                        city: json['First Pick City'],
                        state: json['First Pick State'],
                        zipcode: json['First Pick Postal']
                    })

                    // console.log('New Location: ', newLocation.toJSON())

                    await newLocation.save()

                    if (await newLane(json)) { // EXISTING CUSTOMER NEW LOCATION NEW LANE

                        const newLane = await createLane(json)

                        console.log('New lane: ', newLane.toJSON())

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

                        // console.log('New Lane added: ', newCustLane.toJSON())

                        const newLoad = await Load.create({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                        // console.log('New Load added: ', newLoad.toJSON())
                    }

                } else { // EXISTING CUSTOMER EXISTING LOCATION NEW LANE

                    if (await newLane(json)) {

                        const newLane = await createLane(json)

                        console.log('New lane: ', newLane.toJSON())

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


                        // console.log('New Lane added: ', newCustLane.toJSON())

                        const newLoad = await Load.create({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                        // console.log('New Load added: ', newLoad.toJSON())
                    }
                }
            }

        } else {

            console.log('Load Already Added: ', json)

        }
    }
}

parseCSV()