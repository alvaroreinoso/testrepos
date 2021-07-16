require('dotenv').config()
const fetch = require('node-fetch')

module.exports.getLngLat = async (address) => {
  if (address.split(',').length == 2) {
    const resp = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?types=place&access_token=${process.env.REACT_APP_MAPBOX_KEY}`
    )
    const respJson = await resp.json()

    if (respJson.features.length == 0) {
      return null
    }

    const coords = respJson.features[0].geometry.coordinates
    const lnglat = await coords.toString()

    return lnglat
  } else {
    const resp = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?types=address&access_token=${process.env.REACT_APP_MAPBOX_KEY}`
    )
    const respJson = await resp.json()

    if (respJson.features.length == 0) {
      return null
    }

    const coords = respJson.features[0].geometry.coordinates
    const lnglat = await coords.toString()

    return lnglat
  }
}

module.exports.getRoute = async (cLngLat, lpLngLat) => {
  const [cLng, cLat] = cLngLat.split(',')
  const [lpLng, lpLat] = lpLngLat.split(',')
  const result = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${cLng},${cLat};${lpLng},${lpLat}?geometries=polyline&overview=full&access_token=${process.env.REACT_APP_MAPBOX_KEY}`
  ).then((resp) => resp.json())

  if (result.routes[0] === undefined) {
    return null
  }

  const route = result.routes[0].geometry

  return route
}

module.exports.getLaneRoute = async (cLngLat, lpLngLat) => {
  // const [cLng, cLat] = cLngLat.split(',')
  // const [lpLng, lpLat] = lpLngLat.split(',')
  const result = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${cLngLat};${lpLngLat}?geometries=polyline&overview=full&access_token=${process.env.REACT_APP_MAPBOX_KEY}`
  ).then((resp) => resp.json())

  const route = result.routes[0].geometry

  return route
}

module.exports.parseLocation = (request) => {
  if (request.address) {
    return `${request.address}, ${request.city}, ${request.state}`
  } else {
    return `${request.city}, ${request.state}`
  }
}
