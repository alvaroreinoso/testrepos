'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, CustomerTag, BrokerageTag, UserTag, TeamTag, Brokerage, User, Team, LocationTag, Tag, LaneTag, Location, Lane } = require('.././models')
const noOtherAssoications = require('.././helpers/noAssociatedTags').noOtherAssociations
const corsHeaders = require('.././helpers/cors')
const { Op } = require("sequelize");

module.exports.getTags = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const type = event.queryStringParameters.tagType
        const id = event.pathParameters.itemId

        switch (type) {

            case 'lane': {

                const lane = await Lane.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (lane === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const customTags = await lane.getTags({
                    where: {
                        type: 'Custom'
                    }
                })

                const otherTags = await lane.getTags({
                    where: {
                        type: {
                            [Op.not]: 'Custom'
                        }
                    }
                })

                const data = customTags.concat(otherTags)


                return {
                    body: JSON.stringify(data),
                    headers: corsHeaders,
                    statusCode: 200
                }

            } case 'location': {

                const location = await Location.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (location === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const customTags = await location.getTags({
                    where: {
                        type: 'Custom'
                    }
                })

                const otherTags = await location.getTags({
                    where: {
                        type: {
                            [Op.not]: 'Custom'
                        }
                    }
                })

                const tags = customTags.concat(otherTags)

                return {
                    body: JSON.stringify(tags),
                    headers: corsHeaders,
                    statusCode: 200
                }

            } case 'customer': {

                const customer = await Customer.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (customer === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const customTags = await customer.getTags({
                    where: {
                        type: 'Custom'
                    }
                })

                const otherTags = await customer.getTags({
                    where: {
                        type: {
                            [Op.not]: 'Custom'
                        }
                    }
                })

                const tags = customTags.concat(otherTags)

                return {
                    body: JSON.stringify(tags),
                    headers: corsHeaders,
                    statusCode: 200
                }
            } case 'user': {

                const targetUser = await User.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (targetUser === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const customTags = await targetUser.getTags({
                    where: {
                        type: 'Custom'
                    }
                })

                const otherTags = await targetUser.getTags({
                    where: {
                        type: {
                            [Op.not]: 'Custom'
                        }
                    }
                })

                const tags = customTags.concat(otherTags)

                return {
                    body: JSON.stringify(tags),
                    headers: corsHeaders,
                    statusCode: 200
                }
            } case 'brokerage': {

                const brokerage = await Brokerage.findOne({
                    where: {
                        id: id
                    }
                })

                if (brokerage.id != user.brokerageId) {
                    return {
                        statusCode: 401,
                        headers: corsHeaders
                    }
                }

                const customTags = await brokerage.getTags({
                    where: {
                        type: 'Custom'
                    }
                })

                const otherTags = await brokerage.getTags({
                    where: {
                        type: {
                            [Op.not]: 'Custom'
                        }
                    }
                })

                const tags = customTags.concat(otherTags)

                return {
                    body: JSON.stringify(tags),
                    headers: corsHeaders,
                    statusCode: 200
                }
            } case 'team': {

                const team = await Team.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (team === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const customTags = await team.getTags({
                    where: {
                        type: 'Custom'
                    }
                })

                const otherTags = await team.getTags({
                    where: {
                        type: {
                            [Op.not]: 'Custom'
                        }
                    }
                })

                const tags = customTags.concat(otherTags)

                return {
                    body: JSON.stringify(tags),
                    headers: corsHeaders,
                    statusCode: 200
                }

            } default: {

                return {
                    headers: corsHeaders,
                    statusCode: 500
                }
            }
        }

    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.addTag = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id === null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const type = event.queryStringParameters.tagType
        const request = JSON.parse(event.body)
        const id = event.pathParameters.itemId
        const existing = event.queryStringParameters.existing

        if (existing == 'true') {

            const tag = await Tag.findOne({
                where: {
                    id: request.tagId
                }
            })

            switch (type) {

                case 'lane': {

                    const lane = await Lane.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (lane === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await LaneTag.findOrCreate({
                        where: {
                            laneId: lane.id,
                            tagId: tag.id
                        }
                    })

                    break;

                }
                case 'user': {

                    const targetUser = await User.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (targetUser === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await UserTag.findOrCreate({
                        where: {
                            userId: targetUser.id,
                            tagId: tag.id
                        }
                    })

                    break;

                } case 'brokerage': {

                    const brokerage = await Brokerage.findOne({
                        where: {
                            id: id,
                        }
                    })

                    if (brokerage.id != user.brokerageId) {
                        return {
                            statusCode: 401,
                            headers: corsHeaders
                        }
                    }

                    await BrokerageTag.findOrCreate({
                        where: {
                            brokerageId: brokerage.id,
                            tagId: tag.id
                        }
                    })

                    break
                }
                case 'team': {

                    const team = await Team.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (team === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await TeamTag.findOrCreate({
                        where: {
                            teamId: team.id,
                            tagId: tag.id
                        }
                    })

                    break;
                }
                case 'location': {

                    const location = await Location.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (location === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await LocationTag.findOrCreate({
                        where: {
                            locationId: location.id,
                            tagId: tag.id
                        }
                    })

                    break;

                } case 'customer': {

                    const customer = await Customer.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (customer === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await CustomerTag.findOrCreate({
                        where: {
                            customerId: customer.id,
                            tagId: tag.id
                        }
                    })

                    break;

                } default: {

                    return {
                        headers: corsHeaders,
                        statusCode: 500
                    }
                }
            }

            return {
                headers: corsHeaders,
                statusCode: 204
            }
        }

        else {

            const tag = await Tag.create({
                type: request.type,
                content: request.content
            })

            switch (type) {

                case 'lane': {

                    const lane = await Lane.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (lane === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await LaneTag.create({
                        laneId: lane.id,
                        tagId: tag.id
                    })

                    break

                } case 'location': {

                    const location = await Location.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (location === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await LocationTag.create({
                        locationId: location.id,
                        tagId: tag.id
                    })

                    break

                } case 'customer': {

                    const customer = await Customer.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (customer === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await CustomerTag.create({
                        customerId: customer.id,
                        tagId: tag.id
                    })

                    break
                }

                case 'user': {

                    const targetUser = await User.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (targetUser === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await UserTag.findOrCreate({
                        where: {
                            userId: targetUser.id,
                            tagId: tag.id
                        }
                    })

                    break;

                } case 'brokerage': {

                    const brokerage = await Brokerage.findOne({
                        where: {
                            id: id,
                        }
                    })

                    if (brokerage.id != user.brokerageId) {
                        return {
                            statusCode: 401,
                            headers: corsHeaders
                        }
                    }

                    await BrokerageTag.findOrCreate({
                        where: {
                            brokerageId: brokerage.id,
                            tagId: tag.id
                        }
                    })

                    break
                }
                case 'team': {

                    const team = await Team.findOne({
                        where: {
                            id: id,
                            brokerageId: user.brokerageId
                        }
                    })

                    if (team === null) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders
                        }
                    }

                    await TeamTag.findOrCreate({
                        where: {
                            teamId: team.id,
                            tagId: tag.id
                        }
                    })

                    break;
                }
                default: {
                    return {
                        headers: corsHeaders,
                        statusCode: 500
                    }
                }
            }

            return {
                headers: corsHeaders,
                statusCode: 204
            }
        }
    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.deleteTag = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id === null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)
        const type = event.queryStringParameters.tagType

        switch (type) {

            case 'lane': {

                const laneTag = await LaneTag.findOne({
                    where: {
                        laneId: request.LaneTag.laneId,
                        tagId: request.LaneTag.tagId
                    }
                })

                const lane = await Lane.findOne({
                    where: {
                        id: request.LaneTag.laneId
                    }
                })

                if (lane.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (laneTag === null) {
                    return {
                        headers: corsHeaders,
                        statusCode: 404
                    }
                }

                await laneTag.destroy()

                const tag = await Tag.findOne({
                    where: {
                        id: laneTag.tagId
                    },
                    include: { all: true }
                })

                if (await noOtherAssoications(tag)) {

                    await tag.destroy()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204
                }

            } case 'location': {

                const locationTag = await LocationTag.findOne({
                    where: {
                        locationId: request.LocationTag.locationId,
                        tagId: request.LocationTag.tagId
                    }
                })

                const location = await Location.findOne({
                    where: {
                        id: request.LocationTag.locationId
                    }
                })

                if (location.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (locationTag === null) {
                    return {
                        headers: corsHeaders,
                        statusCode: 404
                    }
                }

                await locationTag.destroy()

                const tag = await Tag.findOne({
                    where: {
                        id: locationTag.tagId
                    },
                    include: { all: true }
                })

                if (await noOtherAssoications(tag)) {

                    await tag.destroy()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204
                }
            }
            case 'customer': {

                const customerTag = await CustomerTag.findOne({
                    where: {
                        customerId: request.CustomerTag.customerId,
                        tagId: request.CustomerTag.tagId
                    },
                })

                const customer = await Customer.findOne({
                    where: {
                        id: request.CustomerTag.customerId
                    }
                })

                if (customer.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (customerTag === null) {
                    return {
                        headers: corsHeaders,
                        statusCode: 404
                    }
                }

                await customerTag.destroy()

                const tag = await Tag.findOne({
                    where: {
                        id: customerTag.tagId
                    },
                    include: { all: true }
                })

                if (await noOtherAssoications(tag)) {

                    await tag.destroy()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204
                }
            }
            case 'user': {

                const userTag = await UserTag.findOne({
                    where: {
                        userId: request.UserTag.userId,
                        tagId: request.UserTag.tagId
                    },
                })

                const targetUser = await User.findOne({
                    where: {
                        id: request.UserTag.userId
                    }
                })

                if (targetUser.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (userTag === null) {
                    return {
                        headers: corsHeaders,
                        statusCode: 404
                    }
                }

                await userTag.destroy()

                const tag = await Tag.findOne({
                    where: {
                        id: userTag.tagId
                    },
                    include: { all: true }
                })

                if (await noOtherAssoications(tag)) {

                    await tag.destroy()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204
                }
            }
            case 'brokerage': {

                const brokerageTag = await BrokerageTag.findOne({
                    where: {
                        brokerageId: request.BrokerageTag.brokerageId,
                        tagId: request.BrokerageTag.tagId
                    }
                })

                if (request.BrokerageTag.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (brokerageTag === null) {
                    return {
                        headers: corsHeaders,
                        statusCode: 404
                    }
                }

                await brokerageTag.destroy()

                const tag = await Tag.findOne({
                    where: {
                        id: brokerageTag.tagId
                    },
                    include: { all: true }
                })

                if (await noOtherAssoications(tag)) {

                    await tag.destroy()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204
                }
            }
            case 'team': {

                const teamTag = await TeamTag.findOne({
                    where: {
                        teamId: request.TeamTag.teamId,
                        tagId: request.TeamTag.tagId
                    },
                })

                if (user.teamId != request.TeamTag.teamId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (teamTag === null) {
                    return {
                        headers: corsHeaders,
                        statusCode: 404
                    }
                }

                await teamTag.destroy()

                const tag = await Tag.findOne({
                    where: {
                        id: teamTag.tagId
                    },
                    include: { all: true }
                })

                if (await noOtherAssoications(tag)) {

                    await tag.destroy()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204
                }

            }
            default: {
                return {
                    headers: corsHeaders,
                    statusCode: 500
                }
            }
        }
    } catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}