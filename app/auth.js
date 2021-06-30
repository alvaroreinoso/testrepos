const jwt = require('jsonwebtoken')

class Auth {
    constructor(db) {
        this.db = db
    }

    async currentUser(token) {
        try {
            const cognitoUser = jwt.decode(token)

            const results = await this.db.User.findOne({
                where: {
                    email: cognitoUser.email
                }
            })

            console.log(results.email)

            if (results === null) {

                return {
                    statusCode: 401
                }
            }
            return results

        } catch (error) {
            console.log(error)
            return {
                statusCode: 401
            }
        }
    }
}

module.exports = Auth;