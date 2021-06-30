const Auth = require('../app/auth')
const UserHelpers = require('../helpers/userHelpers')
const corsHeaders = require('.././helpers/cors')
const jwt = require('jsonwebtoken')
const { getLaneWhereOptionsByStatus } = require('../helpers/getLaneWhereOptionsByStatus');

class Users {
    constructor(db) {
        this.db = db;
        this.auth = new Auth(this.db);
        this.helpers = new UserHelpers(this.db);
    }

    async get(event) {
        try {
            const token = event.headers.Authorization

            const cognitoUser = jwt.decode(token)

            if (cognitoUser == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 401,
                }
            }

            const user = await this.db.User.findOne({
                where: {
                    username: cognitoUser['cognito:username']
                },
            })

            if (user == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 404,
                }
            }

            console.log(user.email)

            return {
                headers: corsHeaders,
                statusCode: 200,
                body: JSON.stringify(user),
            }

        } catch (err) {
            console.log(err)
            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }

    async getById(event) {
        try {
            const currentUser = await this.auth.currentUser(event.headers.Authorization)

            if (currentUser.id == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 401
                }
            }

            const targetUserId = event.pathParameters.userId

            const user = await this.db.User.findOne({
                where: {
                    id: targetUserId,
                    brokerageId: currentUser.brokerageId
                },
                include: [{
                    model: this.db.Team,
                },
                {
                    model: this.db.Brokerage,
                    required: true
                }]
            })

            if (user == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 404,
                }
            }

            const customers = await user.getCustomers()
            user.dataValues.customerCount = customers.length

            const lanes = await user.getLanes()

            if (lanes.length == 0) {
                user.dataValues.revenue = 0
                user.dataValues.loadsPerMonth = 0

                return {
                    body: JSON.stringify(user),
                    headers: corsHeaders,
                    statusCode: 200
                }
            }
            const laneSpend = await lanes.map(lane => lane.spend)
            const revenue = await laneSpend.reduce((a, b) => (a + b))
            user.dataValues.revenue = revenue

            const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))
            user.dataValues.loadsPerMonth = loadsPerMonth.currentVolume

            return {
                body: JSON.stringify(user),
                headers: corsHeaders,
                statusCode: 200
            }

        } catch (err) {
            console.log(err)
            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }

    async getEmailById(event) {
        try {
            const userId = event.pathParameters.userId

            const user = await this.db.User.findOne({
                where: {
                    id: userId
                }
            })

            return {
                body: JSON.stringify(user.email),
                statusCode: 200,
                headers: corsHeaders
            }
        } catch (err) {
            console.log(err)
            return {
                statusCode: 500,
                headers: corsHeaders
            }
        }
    }

    async createProfile(event) {
        try {
            const req = JSON.parse(event.body)

            await this.db.User.create({
                username: req.username,
                email: req.email,
                brokerageId: req.brokerageId,
            })

            return {
                headers: corsHeaders,
                statusCode: 200,
            }

        } catch (err) {

            console.log(err)
            return {
                headers: corsHeaders,
                statusCode: 500,
            }

        }
    }

    async updateProfile(event) {
        try {
            const user = await this.auth.currentUser(event.headers.Authorization)

            const req = JSON.parse(event.body)

            user.firstName = req.firstName
            user.lastName = req.lastName
            user.phone = req.phone
            user.title = req.title
            user.teamId = req.teamId
            user.profileImage = req.profileImage
            user.username = req.username
            user.confirmed = true

            await user.save()

            return {
                headers: corsHeaders,
                statusCode: 200,
            }
        } catch (err) {

            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }

    async update(event) {
        try {
            const user = await this.auth.currentUser(event.headers.Authorization)

            console.log('yooo')

            if (user.id == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 401
                }
            }

            if (user.admin == false) {
                return {
                    headers: corsHeaders,
                    statusCode: 403
                }
            }

            const targetUserId = event.pathParameters.userId

            const targetUser = await this.db.User.findOne({
                where: {
                    id: targetUserId,
                    brokerageId: user.brokerageId,
                    deleted: false,
                },
                paranoid: false
            })

            if (targetUser == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 404
                }
            }

            const request = JSON.parse(event.body)

            const activationStatus = request.active
            const adminStatus = request.admin


            if (targetUser.admin == true) {

                const adminUsers = await User.findAll({
                    where: {
                        brokerageId: user.brokerageId,
                        admin: true,
                    }
                })

                if (adminUsers.length == 1) {

                    if (activationStatus == true && adminStatus == true) {

                        return {
                            headers: corsHeaders,
                            statusCode: 204
                        }
                    }
                    const message = "Cannot remove last admin for brokerage"
                    return {
                        headers: corsHeaders,
                        statusCode: 400,
                        body: JSON.stringify(message)
                    }

                } else {

                    targetUser.admin = adminStatus

                    await targetUser.save()

                    if (activationStatus == false) {

                        targetUser.active = false

                        await targetUser.destroy()
                    }

                    else {
                        targetUser.active = true

                        await targetUser.restore()
                    }

                    return {
                        headers: corsHeaders,
                        statusCode: 204,
                    }
                }

            } else {

                targetUser.admin = adminStatus

                await targetUser.save()

                if (activationStatus == false) {

                    targetUser.active = false

                    await targetUser.destroy()
                }

                else {
                    targetUser.active = true

                    await targetUser.restore()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204,
                }
            }

        } catch (err) {
            return {
                headers: corsHeaders,
                statusCode: 500
            }
        }
    }

    async delete(event) {
        const user = await this.auth.currentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        if (user.admin == false) {
            return {
                headers: corsHeaders,
                statusCode: 403
            }
        }

        const targetUserId = event.pathParameters.userId

        const targetUser = await this.db.User.findOne({
            where: {
                id: targetUserId,
                brokerageId: user.brokerageId
            }
        })

        if (targetUser == null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        if (targetUser.admin == true) {
            const adminUsers = await this.db.User.findAll({
                where: {
                    brokerageId: user.brokerageId,
                    admin: true
                }
            })

            if (adminUsers.length == 1) {

                const message = "Cannot remove last admin from brokerage"
                return {
                    headers: corsHeaders,
                    statusCode: 400,
                    body: JSON.stringify(message)
                }
            } else {
                targetUser.deleted = true
                targetUser.active = false
                await targetUser.destroy()
                return {
                    headers: corsHeaders,
                    statusCode: 204
                }
            }

        } else {
            targetUser.deleted = true
            targetUser.active = false
            await targetUser.destroy()

            return {
                headers: corsHeaders,
                statusCode: 204,
            }
        }
    }

    async getTopCustomers(event) {
        try {
            const currentUser = await this.auth.currentUser(event.headers.Authorization)
            const userId = event.pathParameters.userId

            if (currentUser.id === null) {
                return {
                    headers: corsHeaders,
                    statusCode: 401,
                }
            }

            const targetUser = await this.db.User.findOne({
                where: {
                    id: userId,
                    brokerageId: currentUser.brokerageId
                }
            })

            if (targetUser === null) {
                return {
                    headers: corsHeaders,
                    statusCode: 404,
                }
            }

            const status = event.queryStringParameters.status

            const customers = await targetUser.getCustomers()

            const customersWithSpend = await customers.map(async customer => {

                // use top lanes and pass in status
                [customer.dataValues.spend, customer.dataValues.loadsPerMonth] = await this.helpers.getCustomerSpendAndLoadCount(customer, status)

                return customer
            })

            const customersResolved = await Promise.all(customersWithSpend)
            const topCustomers = [...customersResolved].sort((a, b) => { return b.dataValues.spend - a.dataValues.spend })

            const response = {
                body: JSON.stringify(topCustomers),
                headers: corsHeaders,
                statusCode: 200,
            }

            return response
        } catch (err) {
            console.log(err)

            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }

    async getTopLanes(event) {
        const currentUser = await this.auth.currentUser(event.headers.Authorization)
        const userId = event.pathParameters.userId

        if (currentUser.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401,
            }
        }

        try {
            const targetUser = await this.db.User.findOne({
                where: {
                    id: userId,
                    brokerageId: currentUser.brokerageId
                }
            })

            if (targetUser == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 404,
                }
            }

            const status = event.queryStringParameters.status
            const laneWhereOptions = getLaneWhereOptionsByStatus(status)

            const lanes = await targetUser.getLanes({
                where: laneWhereOptions,
                include: [{
                    model: this.db.Location,
                    as: 'origin',
                    required: true,
                    include: [{
                        model: this.db.CustomerLocation,
                        include: {
                            model: this.db.Customer,
                            required: true
                        }
                    }, {
                        model: this.db.LanePartner
                    }]
                }, {
                    model: this.db.Location,
                    as: 'destination',
                    required: true,
                    include: [{
                        model: this.db.CustomerLocation,
                        include: {
                            model: this.db.Customer,
                            required: true
                        }
                    }, {
                        model: this.db.LanePartner
                    }]
                }]
            })

            if (lanes.length == 0) {
                const body = {
                    loadsPerMonth: 0,
                    spend: 0,
                    Lanes: lanes
                }

                return {
                    body: JSON.stringify(body),
                    headers: corsHeaders,
                    statusCode: 200
                }
            }

            switch (status) {
                case 'owned': {
                    const sortedLanes = await lanes.sort((a, b) => b.spend - a.spend)

                    const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))
                    const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))

                    const body = {
                        loadsPerMonth: loadsPerMonth.currentVolume,
                        spend: totalSpend.spend,
                        Lanes: sortedLanes
                    }

                    return {
                        body: JSON.stringify(body),
                        statusCode: 200,
                        headers: corsHeaders
                    }
                } case 'opportunities': {
                    const sortedLanes = await lanes.sort((a, b) => b.opportunitySpend - a.opportunitySpend)
                    const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

                    const loadsPerMonth = await lanes.reduce((a, b) => ({ opportunityVolume: a.opportunityVolume + b.opportunityVolume }))
                    const totalOpportunitySpend = totalSpend.opportunitySpend

                    const body = {
                        loadsPerMonth: loadsPerMonth.opportunityVolume,
                        spend: totalOpportunitySpend,
                        Lanes: sortedLanes
                    }

                    return {
                        body: JSON.stringify(body),
                        statusCode: 200,
                        headers: corsHeaders
                    }

                } case 'potential': {
                    const sortedLanes = await lanes.sort((a, b) => b.potentialSpend - a.potentialSpend)

                    const totalSpend = await lanes.reduce((a, b) => ({ potentialSpend: a.potentialSpend + b.potentialSpend }))

                    const loadsPerMonth = await lanes.reduce((a, b) => ({ potentialVolume: a.potentialVolume + b.potentialVolume }))

                    const body = {
                        loadsPerMonth: loadsPerMonth.potentialVolume,
                        spend: totalSpend.potentialSpend,
                        Lanes: sortedLanes
                    }

                    return {
                        body: JSON.stringify(body),
                        statusCode: 200,
                        headers: corsHeaders
                    }
                }
            }
        } catch (err) {
            console.log(err)
            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }

    async getAdminUsers(event) {
        try {
            const currentUser = await this.auth.currentUser(event.headers.Authorization)
    
            if (currentUser.id == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 401
                }
            }
    
            const admins = await this.db.User.findAll({
                where: {
                    brokerageId: currentUser.brokerageId,
                    admin: true
                }
            })
    
            if (admins.length == 0) {
                return {
                    headers: corsHeaders,
                    statusCode: 404,
                }
            }
    
            return {
                body: JSON.stringify(admins),
                headers: corsHeaders,
                statusCode: 200
            }
    
        } catch (err) {
            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }
    
    async getTeams(event) {
        try {
            const user = await this.auth.currentUser(event.headers.Authorization)
    
            const teams = await this.db.Team.findAll({
                where: {
                    brokerageId: user.brokerageId
                }
            })
    
            return {
                headers: corsHeaders,
                statusCode: 200,
                body: JSON.stringify(teams),
            }
    
        } catch (err) {
            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }
}

module.exports = Users;