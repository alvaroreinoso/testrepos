const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner } = require('./models');
const { newLoad, newCustomer, newLane, createLane, currentCustomer, getLngLat, getRoute } = require('./helpers/csvDump/ascend')
const csv = require('csvtojson')


const csvFilePath = 'clean.csv'

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

                // console.log('New Customer Lane added: ', newCustLane.toJSON())

                const newLoad = await Load.create({
                    loadId: json['Load ID'],
                    customerLaneId: newCustLane.id
                })

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

                        const newLoad = await Load.create({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })
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

                        const newLoad = await Load.create({
                            loadId: json['Load ID'],
                            customerLaneId: newCustLane.id
                        })

                    }
                }
            }

        } else {

            console.log('Load Already Added: ', json)

        }
    }
}

parseCSV()