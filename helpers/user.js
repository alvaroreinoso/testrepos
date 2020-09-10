const jwt = require('jsonwebtoken')
const db = require('../models/index')

module.exports.getCurrentUser = async (token) => {

    let cognito_user = jwt.decode(token)

        const results = await db.User.findOne({
            where: {
                email: cognito_user.email
            }
        })
        return results
}