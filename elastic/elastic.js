var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7'
});

const { Customer, Lane, LanePartner, Team, CustomerLane, CustomerLocation, CustomerContact } = require('.././models');

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
                    name: { "type": "text" },
                    address: { "type": "text" },
                    address2: { "type": "text" },
                    city: { "type": "text" },
                    state: { "type": "text" },
                    zipcode: { "type": "text" },
                    lnglat: { "type": "text" },
                    open: { "type": "text" },
                    close: { "type": "text" },
                    firstName: { "type": "text" },
                    lastName: { "type": "text" },
                    title: { "type": "text" },
                    phone: { "type": "text" },
                    phoneExt: { "type": "text" },
                    email: { "type": "text" },
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
                name: partner.name,
                address: partner.address,
                address2: partner.address2,
                city: partner.city,
                state: partner.state,
                zipcode: partner.zipcode,
                lnglat: partner.lnglat,
                open: partner.open,
                close: partner.close,
                firstName: partner.firstName,
                lastName: partner.lastName,
                title: partner.title,
                phone: partner.phone,
                phoneExt: partner.phoneExt,
                email: partner.email,
                brokerageId: partner.CustomerLane.CustomerLocation.Customer.Team.brokerageId
            }
        })
    })
}

async function seedCustomerContacts() {

    await client.indices.create({
        index: 'customer_contact',
        body: {
            mappings: {
                properties: {
                    firstName: { "type": "text" },
                    lastName: { "type": "text" },
                    title: { "type": "text" },
                    phone: { "type": "text" },
                    phoneExt: { "type": "text" },
                    email: { "type": "text" },
                    brokerageId: { "type": "integer"}
                }
            }
        }
    })

    const contacts = await CustomerContact.findAll({
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
        }]
})

    contacts.forEach((contact) => {
        client.create({
            index: 'customer_contact',
            id: contact.id,
            body: {
                firstName: contact.firstName,
                lastName: contact.lastName,
                title: contact.title,
                phone: contact.phone,
                phoneExt: contact.phoneExt,
                email: contact.email,
                brokerageId: contact.CustomerLocations[0].Customer.Team.brokerageId
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
                    address: { "type": "text" },
                    address2: { "type": "text" },
                    city: { "type": "text" },
                    state: { "type": "text" },
                    zipcode: { "type": "text" },
                    brokerageId: { "type": "integer" }
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
                address: location.address,
                address2: location.address2,
                city: location.city,
                state: location.state,
                zipcode: location.zipcode,
                brokerageId: location.Customer.Team.brokerageId
            }
        })
    })
}


async function setUp() {
    await seedLanePartners()
    await seedLanes()
    await seedCustomer()
    await seedTeams()
    await seedCustomerContacts()
    await seedCustomerLocatioins()
}

setUp()


