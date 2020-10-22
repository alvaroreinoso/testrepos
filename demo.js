const csvFilePath = 'clean.csv'
const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane } = require('./models');
const csv = require('csvtojson')

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

        if (existingLoad == null) {

            console.log('This Load Does not exist')

            const existingCustomer = await Customer.findOne({
                where: {
                    name: json.Customer
                }
            })

            if (existingCustomer == null) { // NEW CUSTOMER

                console.log('The Customer did not exist')

                const customer = await Customer.build({
                    name: json.Customer,
                    Ledger: {
                        brokerageId: 1
                    }
                }, {
                    include: Ledger
                })

                await customer.save()

                console.log('New Customer:', customer.toJSON())

                const existingLocation = await CustomerLocation.findOne({
                    where: {
                        customerId: customer.id,
                        address: json['First Pick Address']
                    }
                })

                

                if (existingLocation == null) { // NEW CUSTOMER NEW LOCATION

                    const customerLocation = await CustomerLocation.build({
                        customerId: customer.id,
                        address: json['First Pick Address'],
                        city: json['First Pick City'],
                        state: json['First Pick State'],
                        zipcode: json['First Pick Postal']
                    })

                    console.log('New Location: ', customerLocation.toJSON())

                    await customerLocation.save()

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

                        console.log('New lane: ', newLane)
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

                        console.log('New lane: ', newLane)
                    }
                }

            } else { // EXISTING CUSTOMERS


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

                    console.log('New Location: ', newLocation.toJSON())

                    await newLocation.save()

                    // const newCustLane = await CustomerLane.build({
                    //     customerLocationId: newLocation.id,
                    //     LanePartner: {

                    //     },
                    //     Lane: {

                    //     }
                    // })

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

                        console.log('New lane: ', )
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

                        console.log('New lane: ', newLane)
                    }
                } 

            }



        }


    }
}
// console.log(jsonArray)


parseCSV()