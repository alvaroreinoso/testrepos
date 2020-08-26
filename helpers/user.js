const jwt = require('jsonwebtoken')
const db = require('../db')

module.exports.getCurrentUser = async (token) => {
    
    let cognito_user = jwt.decode(token)

    const results = await db.query(`SELECT * FROM "user" where email = '${cognito_user.email}'`)
    const user_config = results.rows[0]
    
    return user_config
}