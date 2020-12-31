'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Team, User, Customer, Brokerage } = require('.././models');

module.exports.editBrokerage = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.admin == false) {

            return {
                statusCode: 403
            }
        }

        const request = JSON.parse(event.body)

        const brokerage = await Brokerage.findOne({
            where: {
                id: request.id
            }
        })

        brokerage.name = request.name,
        brokerage.address = request.address,
        brokerage.address2 = request.address2,
        brokerage.city = request.city,
        brokerage.state = request.state,
        brokerage.zipcode = request.zipcode,
        brokerage.phone = request.phone

        await brokerage.save()

        return {
            statusCode: 204
        }
    } catch (err) {

        console.log(err)

        return {
            statusCode: 500
        }
    }

}