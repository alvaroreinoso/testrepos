const jwt = require('jsonwebtoken')
const db = require('../models/index')

module.exports = async (token) => {

    try {
        
    const cognitoUser = jwt.decode(token)

        const results = await db.User.findOne({
            where: {
                email: cognitoUser.email
            }
        })

        if (results === null) {

            return {
                statusCode: 401
            }
        }
        return results

    } catch (error) { 
        return {
            statusCode: 401
        }
    }
}