var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7'
});

const { Customer, Lane, LanePartner, Team, CustomerLane, CustomerLocation, User } = require('.././models');

client.ping({

    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

async function seedCustomer() {

    await client.indices.create({
        index: 'customer',
        body: {
            mappings: {
                properties: {
                    id: { "type": "integer"},
                    name: { "type": "text" },
                    industry: { "type": "text" },
                    userId: { "type": "integer" },
                    teamId: { "type": "integer" },
                    brokerageId: { "type": "integer" }
                }
            }
        }
    })

    const customers = await Customer.findAll({
        include: [{
            model: Team,
            required: true
        }]
    })

    customers.forEach((cust) => {
        client.create({
            index: 'customer',
            id: cust.id,
            body: {
                id: cust.id,
                name: cust.name,
                industry: cust.industry,
                userId: cust.userId,
                teamId: cust.teamId,
                brokerageId: cust.Team.brokerageId
            }
        })
    })
}

async function seedLanes() {

    await client.indices.create({
        index: 'lane',
        body: {
            mappings: {
                properties: {
                    id: { "type": "integer"},
                    origin: { "type": "text" },
                    destination: { "type": "text" },
                    brokerageId: { "type": "integer" }
                }
            }
        }
    })

    const lanes = await Lane.findAll({
        include: [{
            model: CustomerLane,
            required: true,
            include: [{
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true,
                    include: [{
                        model: Team,
                        required: true,
                    }]
                }]
            }],
        }]
    })

    lanes.forEach((lane) => {
        client.create({
            index: 'lane',
            id: lane.id,
            body: {
                id: lane.id,
                origin: lane.origin,
                destination: lane.destination,
                brokerageId: lane.CustomerLanes[0].CustomerLocation.Customer.Team.brokerageId
            }
        })
    })
}
async function seedTeams() {

    await client.indices.create({
        index: 'team',
        body: {
            mappings: {
                properties: {
                    id: { "type": "integer"},
                    name: { "type": "text" },
                    brokerageId: { "type": "integer" }
                }
            }
        }
    })

    const teams = await Team.findAll()

    teams.forEach((team) => {
        client.create({
            index: 'team',
            id: team.id,
            body: {
                id: team.id,
                name: team.name,
                brokerageId: team.brokerageId
            }
        })
    })
}

async function seedLanePartners() {

    await client.indices.create({
        index: 'lane_partner',
        body: {
            mappings: {
                properties: {
                    id: { "type": "integer"},
                    name: { "type": "text" },
                    address: { "type": "text" },
                    address2: { "type": "text" },
                    city: { "type": "text" },
                    state: { "type": "text" },
                    zipcode: { "type": "text" },
                    lnglat: { "type": "text" },
                    open: { "type": "text" },
                    close: { "type": "text" },
                    title: { "type": "text" },
                    brokerageId: { "type": "text"}
                }
            }
        }
    })

    const partners = await LanePartner.findAll({
        include: [{
            model: CustomerLane,
            required: true,
            include: [{
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true,
                    include: [{
                        model: Team,
                        required: true,
                    }]
                }]
            }],
        }]
    })

    partners.forEach((partner) => {
        client.create({
            index: 'lane_partner',
            id: partner.id,
            body: {
                id: partner.id,
                name: partner.name,
                address: partner.address,
                address2: partner.address2,
                city: partner.city,
                state: partner.state,
                zipcode: partner.zipcode,
                lnglat: partner.lnglat,
                open: partner.open,
                close: partner.close,
                title: partner.title,
                brokerageId: partner.CustomerLane.CustomerLocation.Customer.Team.brokerageId
            }
        })
    })
}

async function seedCustomerLocatioins() {

    await client.indices.create({
        index: 'customer_location',
        body: {
            mappings: {
                properties: {
                    id: { "type": "integer"},
                    address: { "type": "text" },
                    address2: { "type": "text" },
                    city: { "type": "text" },
                    state: { "type": "text" },
                    zipcode: { "type": "text" },
                    brokerageId: { "type": "integer" },
                    customerName: { "type": "text" },
                    customerId: { "type": "integer" }
                }
            }
        }
    })

    const locations = await CustomerLocation.findAll({
            include: [{
                model: Customer,
                required: true,
                include: [{
                    model: Team,
                    required: true,
                }]
        }]
})

    locations.forEach((location) => {
        client.create({
            index: 'customer_location',
            id: location.id,
            body: {
                id: location.id,
                address: location.address,
                address2: location.address2,
                city: location.city,
                state: location.state,
                zipcode: location.zipcode,
                brokerageId: location.Customer.Team.brokerageId,
                customerName: location.Customer.name,
                customerId: location.Customer.id
            }
        })
    })
}

async function seedTeammates() {

    await client.indices.create({
        index: 'teammate',
        body: {
            mappings: {
                properties: {
                    id: { "type": "integer"},
                    title: { "type": "text" },
                    firstName: { "type": "text" },
                    lastName: { "type": "text" },
                    email: { "type": "text" },
                    phone: { "type": "text" },
                    brokerageId: { "type": "integer" }
                }
            }
        }
    })

    const teammates = await User.findAll()

    teammates.forEach((mate) => {
        client.create({
            index: 'teammate',
            id: mate.id,
            body: {
                id: mate.id,
                title: mate.title,
                firstName: mate.firstName,
                lastName: mate.lastName,
                email: mate.email,
                phone: mate.phone,
                brokerageId: mate.brokerageId
            }
        })
    })

}


async function setUp() {

    await client.indices.delete({
        index: '*'
    })

    await seedCustomer()
    await seedCustomerLocatioins()
    await seedLanePartners()
    await seedLanes()
    await seedTeams()
    await seedTeammates()
}

setUp()

