const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner, Carrier } = require('../../models');
require('dotenv').config()
const fetch = require('node-fetch');

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