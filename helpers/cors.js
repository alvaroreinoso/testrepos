require('dotenv').config()

module.exports = {
  'Access-Control-Allow-Origin': process.env.ORIGIN_URL,
  'Access-Control-Allow-Credentials': true,
}
