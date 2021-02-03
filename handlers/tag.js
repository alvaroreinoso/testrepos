'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, CustomerTag, BrokerageTag, UserTag, TeamTag, Brokerage, User, Team, LocationTag, Tag, LaneTag, Location, Lane } = require('.././models')
const elastic = require('.././elastic/hooks')
const noOtherAssoications = require('.././helpers/noAssociatedTags').noOtherAssociations
const corsHeaders = require('.././helpers/cors')

module.exports.getTags = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            headers: corsHeaders,
            statusCode: 401
        }
    }

    try {

        const type = event.queryStringParameters.tagType
        const id = event.pathParameters.itemId

        switch (type) {

            case 'lane': {

                const lane = await Lane.findOne({
                    where: {
                        id: id
                    }
                })

                const laneTags = await lane.getTags()

                return {
                    body: JSON.stringify(laneTags),
                    headers: corsHeaders,
                    statusCode: 200
                }

            } case 'location': {

                const location = await Location.findOne({
                    where: {
                        id: id
                    }
                })

                const locationTags = await location.getTags()

                return {
                    body: JSON.stringify(locationTags),
                    headers: corsHeaders,
                    statusCode: 200
                }

            } case 'customer': {

                const customer = await Customer.findOne({
                    where: {
                        id: id
                    }
                })

                const customerTags = await customer.getTags()

                return {
                    body: JSON.stringify(customerTags),
                    headers: corsHeaders,
                    statusCode: 200
                }
            } case 'user': {

                const user = await User.findOne({
                    where: {
                        id: id
                    }
                })

                const userTags = await user.getTags()

                return {
                    body: JSON.stringify(userTags),
                    headers: corsHeaders,
                    statusCode: 200
                }
            } case 'brokerage': {

                const brokerage = await Brokerage.findOne({
                    where: {
                        id: id
                    }
                })

                const brokerageTags = await brokerage.getTags()

                return {
                    body: JSON.stringify(brokerageTags),
                    headers: corsHeaders,
                    statusCode: 200
                }
            } case 'team': {

                const team = await Team.findOne({
                    where: {
                        id: id
                    }
                })

                const teamTags = await team.getTags()

                return {
                    body: JSON.stringify(teamTags),
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

        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.addTag = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
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

                    await LaneTag.findOrCreate({
                        where: {
                            laneId: id,
                            tagId: tag.id
                        }
                    })

                    break;

                }
                case 'user': {

                    await UserTag.findOrCreate({
                        where: {
                            userId: id,
                            tagId: tag.id
                        }
                    })

                    break;

                } case 'brokerage': {

                    await BrokerageTag.findOrCreate({
                        where: {
                            brokerageId: id,
                            tagId: tag.id
                        }
                    })

                    break
                }
                case 'team': {

                    await TeamTag.findOrCreate({
                        where: {
                            teamId: id,
                            tagId: tag.id
                        }
                    })

                    break;
                }
                case 'location': {

                    await LocationTag.findOrCreate({
                        where: {
                            locationId: id,
                            tagId: tag.id
                        }
                    })

                    break;

                } case 'customer': {

                    await CustomerTag.findOrCreate({
                        where: {
                            customerId: id,
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

                    await LaneTag.create({
                        laneId: id,
                        tagId: tag.id
                    })

                    break

                } case 'location': {

                    await LocationTag.create({
                        locationId: id,
                        tagId: tag.id
                    })

                    break

                } case 'customer': {

                    await CustomerTag.create({
                        customerId: id,
                        tagId: tag.id
                    })

                    break

                }

                case 'user': {

                    await UserTag.findOrCreate({
                        where: {
                            userId: id,
                            tagId: tag.id
                        }
                    })

                    break;

                } case 'brokerage': {

                    await BrokerageTag.findOrCreate({
                        where: {
                            brokerageId: id,
                            tagId: tag.id
                        }
                    })

                    break
                }
                case 'team': {

                    await TeamTag.findOrCreate({
                        where: {
                            teamId: id,
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

        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.deleteTag = async (event, context) => {

    try {

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
                    }
                })

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
                    }
                })

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
                    }
                })

                if (brokerageTag === null) {

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