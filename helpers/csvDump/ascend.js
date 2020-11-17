const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('../../models');
require('dotenv').config()
const fetch = require('node-fetch');
const stringSimilarity = require('string-similarity');

module.exports.newLoad = async (load) => {

    const existingLoad = await Load.findOne({
        where: {
            loadId: load['Load ID']
        }
    })

    if (existingLoad == null) {

        return true

    } else {

        return false
    }

}

module.exports.internalLane = async (json) => {


    const firstPick = json['First Pick Name']
    const lastDrop = json['Last Drop Name']

    const likeness = stringSimilarity.compareTwoStrings(firstPick, lastDrop)

    if (likeness > .7) {

        console.log('true')
        return true
    }
}

module.exports.matchedInternalLane = async (json) => {

    const customer = json.Customer

    async function customerIsFirstPick(json) {

        if (customer === json['First Pick Name']) {

            return true

        }
    }

    async function customerIsLastDrop(json) {

        if (customer === json['Last Drop Name']) {

            return true

        }

    }

    async function internalLane(json) {


        const firstPick = json['First Pick Name']
        const lastDrop = json['Last Drop Name']

        const likeness = stringSimilarity.compareTwoStrings(firstPick, lastDrop)

        if (likeness > .7) {

            // console.log('true')
            return true
        }
    }

    if (await customerIsFirstPick(json) || await customerIsLastDrop(json)) {


        if (await internalLane(json)) {

            return true
        }
        else {

            return false
        }
    }



}

module.exports.newCustomer = async (json) => {

    const existingCustomer = await Customer.findOne({
        where: {
            name: json.Customer
        }
    })

    if (existingCustomer == null) {

        return true

    } else {

        return false
    }

}

module.exports.newLane = async (json) => {

    const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
    const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

    const existingLane = await Lane.findOne({
        where: {
            origin: jsonOrigin,
            destination: jsonDestination
        }
    })

    if (existingLane == null) {
        return true
    } else {

        return false
    }

}

module.exports.getOrCreateSecondLocation = async (json, customer, address, user, lPlngLat) => {


    const existingLocation = await CustomerLocation.findOne({
        where: {
            customerId: customer.id,
            address: address
        }
    })

    if (existingLocation == null) {

        const newLocation = CustomerLocation.create({
            customerId: customer.id,
            address: json['Last Drop Address'],
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

        return newLocation
    }

    else {

        return existingLocation
    }
}

module.exports.getAddress = async (json) => {

    const address = json['First Pick Address'].split(',')[0]

    return address
}

module.exports.getLpAddress = async (json) => {

    const lpAddress = json['Last Drop Address'].split(',')[0]

    return lpAddress
}

module.exports.getDropDate = async (json) => {

    const dateString = json['Last Drop Date']

    console.log(dateString)

    const dropDate = dateString.split(' ')[0]

    return dropDate

}

module.exports.getLane = async (json) => {

    const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
    const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

    const existingLane = await Lane.findOne({
        where: {
            origin: jsonOrigin,
            destination: jsonDestination
        }
    })

    return existingLane
}

module.exports.getOriginAndDestination = async (json) => {

    const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
    const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

    return [jsonOrigin, jsonDestination]
}

module.exports.newCarrier = async (json) => {

    const existingCarrier = await Carrier.findOne({
        where: {
            name: json['Carrier']
        }
    })

    if (existingCarrier == null) {
        return true
    } else {
        return false
    }

}

module.exports.createLane = async (json) => {

    const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
    const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

    const newLane = await Lane.create({
        origin: jsonOrigin,
        destination: jsonDestination
    })

    return newLane

}

module.exports.currentCustomer = async (json) => {

    const existingCustomer = await Customer.findOne({
        where: {
            name: json.Customer
        }
    })

    return existingCustomer
}

module.exports.getLngLat = async (address) => {
    const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${process.env.REACT_APP_MAPBOX_KEY}`)

    const respJson = await resp.json()

    const coords = respJson.features[0].geometry.coordinates

    const lnglat = await coords.toString()

    return lnglat
}

module.exports.getRoute = async (cLngLat, lpLngLat) => {

    const [cLng, cLat] = cLngLat.split(",")
    const [lpLng, lpLat] = lpLngLat.split(",")
    const result = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${cLng},${cLat};${lpLng},${lpLat}?geometries=polyline&overview=full&access_token=${process.env.REACT_APP_MAPBOX_KEY}`).then(resp => resp.json())
    const route = result.routes[0].geometry

    return route
}

module.exports.createInternalLane = async (json, customer) => {

    const cLlngLat = await getLngLat(json['First Pick Address'])
    const address = await getAddress(json)

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

    const lPlngLat = await getLngLat(json['Last Drop Address'])

    const secondLocation = await CustomerLocation.create({
        customerId: customer.Id,
        address: json['Last Drop Address'],
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