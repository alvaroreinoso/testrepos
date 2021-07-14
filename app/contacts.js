const Auth = require('../app/auth')
const corsHeaders = require('.././helpers/cors')

class Contacts {
  constructor(db) {
    this.db = db
    this.auth = new Auth(this.db)
  };
  
  async get(event) {
    if (event.source === 'serverless-plugin-warmup') {
      console.log('WarmUp - Lambda is warm!')
      return 'Lambda is warm!'
    }
  
    const user = await this.auth.currentUser(event.headers.Authorization)
  
    if (user.id == null) {
      return {
        statusCode: 401,
        headers: corsHeaders,
      }
    }
  
    try {
      const type = event.queryStringParameters.contactType
      const id = event.pathParameters.itemId
  
      switch (type) {
        case 'lane': {
         return this._getContactsForLane(id, user)
        }
        case 'location': {
          return this._getContactsForLocation(id, user)
        }
        case 'customer': {
          return this._getContactsForCustomer(id, user)
        }
        default: {
          return {
            statusCode: 500,
            headers: corsHeaders,
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

  async update(event) {
    if (event.source === 'serverless-plugin-warmup') {
      console.log('WarmUp - Lambda is warm!')
      return 'Lambda is warm!'
    }
  
    try {
      const user = await this.auth.currentUser(event.headers.Authorization)
  
      if (user.id == null) {
        return {
          statusCode: 401,
          headers: corsHeaders,
        }
      }
  
      const request = JSON.parse(event.body)
      const id = request.id
  
      const contact = await this.db.Contact.findOne({
        where: {
          id: id,
          brokerageId: user.brokerageId,
        },
      })
  
      if (contact === null) {
        return {
          statusCode: 404,
          headers: corsHeaders,
        }
      }
  
      contact.firstName = request.firstName
      contact.lastName = request.lastName
      contact.title = request.title
      contact.phoneExt = request.phoneExt
      contact.phone = request.phone
      contact.email = request.email
      contact.level = request.level
  
      await contact.save()
  
      return {
        statusCode: 204,
        headers: corsHeaders,
      }
    } catch (err) {
      return {
        statusCode: 500,
        headers: corsHeaders,
      }
    }
  }

  async _getContactsForLane(id, user) {
    const lane = await this.db.Lane.findOne({
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
  
    const laneContacts = await lane.getContacts({
      order: [['level', 'ASC']],
    })
  
    return {
      body: JSON.stringify(laneContacts),
      statusCode: 200,
      headers: corsHeaders,
    }
  }
  
  async _getContactsForLocation(id, user) {
    const location = await this.db.Location.findOne({
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
  
    const locationContacts = await location.getContacts({
      order: [['level', 'ASC']],
    })
  
    return {
      body: JSON.stringify(locationContacts),
      statusCode: 200,
      headers: corsHeaders,
    }
  }
  
  async _getContactsForCustomer(id, user) {
    const customer = await this.db.Customer.findOne({
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
  
    const customerContacts = await customer.getContacts({
      order: [['level', 'ASC']],
    })
  
    return {
      body: JSON.stringify(customerContacts),
      statusCode: 200,
      headers: corsHeaders,
    }
  };
}

module.exports = Contacts
