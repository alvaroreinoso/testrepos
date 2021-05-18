require('dotenv').config()
const fetch = require('node-fetch');

module.exports.getLngLat = async (address) => {
    const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${process.env.REACT_APP_MAPBOX_KEY}`)
    const respJson = await resp.json()

    if (respJson.features.length == 0) {
        return null
    }

    const coords = respJson.features[0].geometry.coordinates
    const lnglat = await coords.toString()

    return lnglat
}

module.exports.getRoute = async (cLngLat, lpLngLat) => {
    const [cLng, cLat] = cLngLat.split(",")
    const [lpLng, lpLat] = lpLngLat.split(",")
    const result = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${cLng},${cLat};${lpLng},${lpLat}?geometries=polyline&overview=full&access_token=${process.env.REACT_APP_MAPBOX_KEY}`).then(resp => resp.json())
    const route = result.routes[0].geometry
    const distance = result.routes[0].distance

    async function getMiles(i) {
        return i * 0.000621371192;
    }

    const mileage = await getMiles(distance)
    const roundedMileage = Math.round(mileage)

    return [route, roundedMileage]
}