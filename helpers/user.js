const jwt = require('jsonwebtoken')
const db = require('../models/index')

module.exports.getCurrentUser = async (token) => {
    
    let cognito_user = jwt.decode(token)

    const results = await db.User.findOne({
        where: {
            email: cognito_user.email
        }
    })

    // query(`SELECT * FROM users where email = '${cognito_user.email}'`)
    // const user_config = results.rows[0]
    
    return results
}