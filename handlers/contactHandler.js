'use strict'
const Contacts = require('../app/contacts')
const db = require('../models/index')
const contacts = new Contacts(db)

module.exports.contactHandler = async (event, context) => {
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUp - Lambda is warm!')
    return 'Lambda is warm!'
  }
  
  switch (event.httpMethod) {
    case 'GET': {
      switch (event.resource) {
        case '/api/contact/{itemId}':
          return contacts.get(event)
      }
    }
    case 'PUT': {
      switch (event.resource) {
        case '/api/contact':
          return contacts.update(event)
      }
    }
  }
}