'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerTag, BrokerageTag, UserTag, TeamTag, Brokerage, User, Team, LocationTag, Tag, LaneTag, Location, Lane } = require('.././models')
const elastic = require('.././elastic/hooks')

module.exports.getTags = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
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
                    statusCode: 200
                }

            } default: {

                console.log(err)

                return {
                    statusCode: 500
                }
            }
        }

    } catch (err) {

        console.log(err)
        return {
            statusCode: 500
        }
    }
}

module.exports.addTag = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
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
                        statusCode: 500
                    }
                }
            }

            return {
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

                } default: {

                    return {
                        statusCode: 500
                    }
                }

            }

            return {
                statusCode: 204
            }
        }
    } catch (err) {

        console.log(err)

        return {
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


                if (tag.Locations.length == 0 && tag.Customers.length == 0 && tag.Lanes.length == 0) {

                    if (tag.id > 70) {
                        await tag.destroy()

                        return {
                            statusCode: 204
                        }
                    } else {
                        return {
                            statusCode: 204
                        }
                    }
                }

                return {
                    body: JSON.stringify(tag),
                    statusCode: 200
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

                if (tag.Locations.length == 0 && tag.Customers.length == 0 && tag.Lanes.length == 0) {

                    if (tag.id > 70) {
                        await tag.destroy()

                        return {
                            statusCode: 204
                        }
                    } else {
                        return {
                            statusCode: 204
                        }
                    }
                }

                return {
                    body: JSON.stringify(tag),
                    statusCode: 200
                }

            } case 'customer': {

                const customerTag = await CustomerTag.findOne({
                    where: {
                        customerId: request.CustomerTag.customerId,
                        tagId: request.CustomerTag.tagId
                    }
                })

                if (customerTag === null) {

                    return {
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

                if (tag.Locations.length == 0 && tag.Customers.length == 0 && tag.Lanes.length == 0) {

                    if (tag.id > 70) {
                        await tag.destroy()

                        return {
                            statusCode: 204
                        }
                    } else {
                        return {
                            statusCode: 204
                        }
                    }
                }

                return {
                    body: JSON.stringify(tag),
                    statusCode: 200
                }

            } default: {

                return {
                    statusCode: 500
                }
            }
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }


}