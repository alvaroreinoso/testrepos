const jwt = require('jsonwebtoken')
const db = require('../models/index')

module.exports.getCurrentUser = async (token) => {

    try {
        
    const cognitoUser = jwt.decode(token)

        const results = await db.User.findOne({
            where: {
                email: cognitoUser.email
            }
        })
        return results

    } catch (error) {
         
        return error

    }
}