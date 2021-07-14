'use strict'
const getCurrentUser = require('.././helpers/user')
const {
  Customer,
  CustomerContact,
  LocationContact,
  Contact,
  LaneContact,
  Location,
  Lane,
} = require('.././models')
const corsHeaders = require('.././helpers/cors')

module.exports.addContact = async (event, context) => {
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUp - Lambda is warm!')
    return 'Lambda is warm!'
  }

  try {
    const user = await getCurrentUser(event.headers.Authorization)
    if (user.id == null) {
      return {
        statusCode: 401,
        headers: corsHeaders,
      }
    }

    const type = event.queryStringParameters.contactType
    const universal = event.queryStringParameters.universal
    const request = JSON.parse(event.body)
    const id = event.pathParameters.itemId
    const existing = event.queryStringParameters.existing

    if (existing == 'true') {
      const contact = await Contact.findOne({
        where: {
          id: request.id,
          brokerageId: user.brokerageId,
        },
      })

      if (universal == 'true') {
        switch (type) {
          case 'customer': {
            const customer = await Customer.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (customer === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await CustomerContact.findOrCreate({
              where: {
                customerId: customer.id,
                contactId: contact.id,
              },
            })

            const customerLocations = await customer.getCustomerLocations({
              include: [
                {
                  model: Location,
                  required: true,
                },
              ],
            })

            for (const customerLocation of customerLocations) {
              const location = customerLocation.Location

              await LocationContact.findOrCreate({
                where: {
                  locationId: location.id,
                  contactId: contact.id,
                },
              })

              const lanes = await location.getLanes()

              for (const lane of lanes) {
                await LaneContact.findOrCreate({
                  where: {
                    laneId: lane.id,
                    contactId: contact.id,
                  },
                })
              }
            }

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          case 'location': {
            const location = await Location.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (location === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await LocationContact.findOrCreate({
              where: {
                locationId: location.id,
                contactId: contact.id,
              },
            })

            const lanes = await location.getLanes()

            for (const lane of lanes) {
              await LaneContact.findOrCreate({
                where: {
                  laneId: lane.id,
                  contactId: contact.id,
                },
              })
            }

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          default: {
            return {
              statusCode: 500,
              headers: corsHeaders,
            }
          }
        }
      } else {
        switch (type) {
          case 'customer': {
            const customer = await Customer.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (customer === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await CustomerContact.findOrCreate({
              where: {
                customerId: customer.id,
                contactId: contact.id,
              },
            })

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          case 'location': {
            const location = await Location.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (location === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await LocationContact.findOrCreate({
              where: {
                locationId: location.id,
                contactId: contact.id,
              },
            })

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          case 'lane': {
            const lane = await Lane.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (lane === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await LaneContact.findOrCreate({
              where: {
                laneId: lane.id,
                contactId: contact.id,
              },
            })

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          default: {
            return {
              statusCode: 500,
              headers: corsHeaders,
            }
          }
        }
      }
    } else {
      const contact = await Contact.create({
        brokerageId: user.brokerageId,
        firstName: request.firstName,
        lastName: request.lastName,
        phoneExt: request.phoneExt,
        phone: request.phone,
        email: request.email,
        level: request.level,
        title: request.title,
      })

      if (universal == 'true') {
        switch (type) {
          case 'customer': {
            const customer = await Customer.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (customer === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await CustomerContact.findOrCreate({
              where: {
                customerId: customer.id,
                contactId: contact.id,
              },
            })

            const customerLocations = await customer.getCustomerLocations({
              include: [
                {
                  model: Location,
                  required: true,
                },
              ],
            })

            for (const customerLocation of customerLocations) {
              const location = customerLocation.Location

              await LocationContact.findOrCreate({
                where: {
                  locationId: location.id,
                  contactId: contact.id,
                },
              })

              const lanes = await location.getLanes()

              for (const lane of lanes) {
                await LaneContact.findOrCreate({
                  where: {
                    laneId: lane.id,
                    contactId: contact.id,
                  },
                })
              }
            }

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          case 'location': {
            const location = await Location.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (location === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await LocationContact.findOrCreate({
              where: {
                locationId: location.id,
                contactId: contact.id,
              },
            })

            const lanes = await location.getLanes()

            for (const lane of lanes) {
              await LaneContact.findOrCreate({
                where: {
                  laneId: lane.id,
                  contactId: contact.id,
                },
              })
            }

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          default: {
            return {
              statusCode: 500,
              headers: corsHeaders,
            }
          }
        }
      } else {
        switch (type) {
          case 'customer': {
            const customer = await Customer.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (customer === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await CustomerContact.findOrCreate({
              where: {
                customerId: customer.id,
                contactId: contact.id,
              },
            })

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          case 'location': {
            const location = await Location.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (location === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await LocationContact.findOrCreate({
              where: {
                locationId: location.id,
                contactId: contact.id,
              },
            })

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          case 'lane': {
            const lane = await Lane.findOne({
              where: {
                id: id,
                brokerageId: user.brokerageId,
              },
            })

            if (lane === null) {
              return {
                statusCode: 404,
                headers: corsHeaders,
              }
            }

            await LaneContact.findOrCreate({
              where: {
                laneId: lane.id,
                contactId: contact.id,
              },
            })

            return {
              statusCode: 204,
              headers: corsHeaders,
            }
          }
          default: {
            return {
              statusCode: 500,
              headers: corsHeaders,
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      headers: corsHeaders,
    }
  }
}

