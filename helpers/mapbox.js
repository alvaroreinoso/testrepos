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