const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('../../models');
require('dotenv').config()
const fetch = require('node-fetch');
const stringSimilarity = require('string-similarity');
const dateFns = require('date-fns')

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

        return true
    }
}

module.exports.firstPickIsCustomer = async (json) => {

    const customer = json.Customer
    const firstPickName = json['First Pick Name']

    const likeness = stringSimilarity.compareTwoStrings(firstPickName, customer)

    if (likeness > .7) {

        return true
    }
}

module.exports.lastDropIsCustomer = async (json) => {

    const customer = json.Customer
    const lastDropName = json['Last Drop Name']

    const likeness = stringSimilarity.compareTwoStrings(lastDropName, customer)

    if (likeness > .7) {

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

    const dropDate = dateString.split(' ')[0]

    const result = dateFns.parse(dropDate, 'MM/dd/yyyy', new Date())

    return result
}

module.exports.getOriginAndDestination = async (json) => {

    const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
    const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

    return [jsonOrigin, jsonDestination]
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