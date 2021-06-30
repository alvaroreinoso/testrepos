'use strict'
const Users = require('../app/users')
const db = require('../models/index')
const users = new Users(db)

module.exports.user = async (event, context) => {
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUp - Lambda is warm!')
    return 'Lambda is warm!'
  }

  switch (event.httpMethod) {
    case 'GET': {
      switch (event.resource) {
        case '/api/user': {
          return users.get(event)
        }
        case '/api/user/email/{userId}': {
          return users.getEmailById(event)
        }
        case '/api/user/{userId}': {
          return users.getById(event)
        }
        case '/api/customer/top/{userId}': {
          return users.getTopCustomers(event)
        }
        case '/api/lane/top/{userId}': {
          return users.getTopLanes(event)
        }
        case '/api/user/admins': {
          return users.getAdminUsers(event)
        }
        case '/api/user/teams': {
          return users.getTeams(event)
        }
      }
    }
    case 'POST': {
      switch (event.resource) {
        case '/api/user': {
          return users.createProfile(event)
        }
      }
    }
    case 'PUT': {
      switch (event.resource) {
        case '/api/user': {
          return users.updateProfile(event)
        }
        case '/api/user/{userId}': {
          return users.update(event)
        }
      }
    }
    case 'DELETE': {
      switch (event.resource) {
        case '/api/user/{userId}': {
          return users.delete(event)
        }
      }
    }
  }
}
