const elasticsearch = require('elasticsearch');
// import stateAbbreviations from 'states-abbreviations';
const stateAbbreviations = require('states-abbreviations')
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

const { Customer, Lane, LanePartner, Team, CustomerLane, CustomerLocation, User, Message, Ledger } = require('.././models');

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

    console.log('Seeded Customers')
}

async function seedMessages() {
    await client.indices.create({
        index: 'message',
    })

    const messages = await Message.findAll({
        include: [{
            model: Ledger,
            required: true
        }]
    })

    messages.forEach(message => {
        client.create({
            index: 'message',
            id: message.id,
            body: {
                id: message.id,
                content: message.content,
                ledgerId: message.ledgerId,
                brokerageId: message.Ledger.brokerageId
            }
        })
    })

    console.log('Seeded Messages')
}
async function seedLanes() {

    await client.indices.create({
        index: 'lane',
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

        const chunks = lane.origin.split(' ')
        const originStateCode = chunks[chunks.length - 1]
        const originState = stateAbbreviations[originStateCode]

        const destinationChunks = lane.destination.split(' ')
        const destinationStateCode = destinationChunks[destinationChunks.length - 1]
        const destinationState = stateAbbreviations[destinationStateCode]

        console.log(originState)
        console.log(destinationState)

        client.create({
            index: 'lane',
            id: lane.id,
            body: {
                id: lane.id,
                origin: lane.origin,
                originStateName: originState,
                destination: lane.destination,
                destinationStateName: destinationState,
                brokerageId: lane.CustomerLanes[0].CustomerLocation.Customer.Team.brokerageId
            }
        })
    })

    console.log('Seeded Lanes')
}

async function seedTeams() {

    await client.indices.create({
        index: 'team',
    })

    const teams = await Team.findAll()

    teams.forEach((team) => {
        client.create({
            index: 'team',
            id: team.id,
            body: {
                id: team.id,
                name: team.name,
                brokerageId: team.brokerageId,
                icon: team.icon
            }
        })
    })

    console.log('Seeded Teams')
}

async function seedLanePartners() {

    await client.indices.create({
        index: 'lane_partner',
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

        const stateName = stateAbbreviations[partner.state]

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
                fullState: stateName,
                zipcode: partner.zipcode,
                lnglat: partner.lnglat,
                open: partner.open,
                close: partner.close,
                title: partner.title,
                brokerageId: partner.CustomerLane.CustomerLocation.Customer.Team.brokerageId
            }
        })
    })

    console.log('Seeded Lane Partners')
}

async function seedCustomerLocatioins() {

    await client.indices.create({
        index: 'customer_location',
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

        const stateName = stateAbbreviations[location.state]

        client.create({
            index: 'customer_location',
            id: location.id,
            body: {
                id: location.id,
                address: location.address,
                address2: location.address2,
                city: location.city,
                state: location.state,
                fullState: stateName,
                zipcode: location.zipcode,
                brokerageId: location.Customer.Team.brokerageId,
                customerName: location.Customer.name,
                customerId: location.Customer.id
            }
        })
    })

    console.log('Seeded Customer Locations')
}

async function seedTeammates() {

    await client.indices.create({
        index: 'teammate',
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

    console.log('Seeded Teammates')
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
    await seedMessages()
}

setUp()


