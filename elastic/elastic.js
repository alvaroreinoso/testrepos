const stateAbbreviations = require('states-abbreviations')
const { Customer, Contact, Lane, LanePartner, Team, Location, CustomerLocation, User, Message, Ledger } = require('.././models');
const client = require('./client')

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

        const customer = {
            name: cust.name,
            brokerageId: cust.Team.brokerageId,
            id: cust.id
        }

        client.create({
            index: 'customer',
            id: cust.id,
            body: customer
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
        }, {
            model: User,
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
                brokerageId: message.Ledger.brokerageId,
                userFirstName: message.User.firstName,
                userLastName: message.User.lastName
            }
        })
    })

    console.log('Seeded Messages')
}
async function seedLanes() {

    await client.indices.create({
        index: 'lane',
    })

    const lanes = await Lane.findAll()

    lanes.forEach(async (lane) => {

        const origin = await lane.getOrigin({
            include: [{
                model: CustomerLocation,
                include: [{
                    model: Customer,
                    required: true,
                    include: [{
                        model: Ledger,
                        required: true
                    }]
                }]
            }]
        })

        const destination = await lane.getDestination({
            include: [{
                model: CustomerLocation,
                include: [{
                    model: Customer,
                    required: true,
                    include: [{
                        model: Ledger,
                        required: true
                    }]
                }]
            }]
        })

        let brokerageId = []

        if (origin.CustomerLocation == null) {

            brokerageId.push(destination.CustomerLocation.Customer.Ledger.brokerageId)

        } else {

            brokerageId.push(origin.CustomerLocation.Customer.Ledger.brokerageId)
        }

        const route = `${origin.city} ${origin.state} to ${destination.city} ${destination.state}`
        const shortRoute = `${origin.city} to ${destination.city}`

        const originState = stateAbbreviations[origin.state]
        const destinationState = stateAbbreviations[destination.state]

        const body = {
            id: lane.id,
            origin: origin.city,
            originStateName: originState,
            destination: destination.city,
            destinationStateName: destinationState,
            route: route,
            shortRoute: shortRoute,
            brokerageId: brokerageId[0]
        }

        client.create({
            index: 'lane',
            id: lane.id,
            body: body
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

    const partners = await LanePartner.findAll()

    partners.forEach(async (partner) => {

        const location = await partner.getLocation()
        const ledger = await location.getLedger()
        const stateName = stateAbbreviations[location.state]

        const lanePartner = {
            name: partner.name,
            address: location.address,
            id: location.id,
            city: location.city,
            state: location.state,
            fullState: stateName,
            zipcode: location.zipcode,
            brokerageId: ledger.brokerageId
        }

        client.create({
            index: 'lane_partner',
            id: partner.id,
            body: lanePartner
        })
    })

    console.log('Seeded Lane Partners')
}

async function seedCustomerLocatioins() {

    await client.indices.create({
        index: 'customer_location',
    })

    const customerLocations = await CustomerLocation.findAll()

    customerLocations.forEach(async (cLocation) => {

        const customer = await cLocation.getCustomer()
        const ledger = await customer.getLedger()
        const location = await cLocation.getLocation()
        const stateName = stateAbbreviations[location.state]

        const customerLocation = {
            customerName: customer.name,
            id: location.id,
            address: location.address,
            city: location.city,
            state: location.state,
            fullState: stateName,
            zipcode: location.zipcode,
            brokerageId: ledger.brokerageId
        }

        client.create({
            index: 'customer_location',
            id: cLocation.id,
            body: customerLocation
        })
    })

    console.log('Seeded Customer Locations')
}

async function seedTeammates() {

    await client.indices.create({
        index: 'user',
    })

    const teammates = await User.findAll()

    teammates.forEach((mate) => {
        client.create({
            index: 'user',
            id: mate.id,
            body: {
                id: mate.id,
                title: mate.title,
                firstName: mate.firstName,
                lastName: mate.lastName,
                fullName: mate.fullName,
                email: mate.email,
                phone: mate.phone,
                brokerageId: mate.brokerageId
            }
        })
    })

    console.log('Seeded Users')
}

async function seedContacts() {

    await client.indices.create({
        index: 'contact',
    })

    const contacts = await Contact.findAll({
        include: [{
            model: Location,
            include: [{
                model: Ledger
            }]
        },
        {
            model: Customer,
            include: [{
                model: Ledger
            }]
        },
        {
            model: Lane,
            include: [{
                model: Location,
                as: 'origin',
                include: [{
                    model: Ledger
                }]
            },
            {
                model: Location,
                as: 'destination',
                include: [{
                    model: Ledger
                }]
            }]
        }]
    })

    contacts.forEach((contact) => {

        let brokerageId = []

        if (contact.Locations.length != 0) {

            brokerageId.push(contact.Locations[0].Ledger.brokerageId)

        } else if (contact.Lanes.length != 0) {

            brokerageId.push(contact.Lanes[0].origin.Ledger.brokerageId)

        } else if (contact.Customers.length != 0) {

            brokerageId.push(contact.Customers[0].brokerageId)
        }

        const doc = {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            fullName: `${contact.firstName} ${contact.lastName}`,
            brokerageId: brokerageId[0]
        }

        client.create({
            index: 'contact',
            id: contact.id,
            body: doc
        })
    })

    console.log('Seeded Contacts')
}


async function setUp() {

    await client.indices.delete({
        index: '*'
    })

    await seedContacts()
    await seedCustomer()
    await seedCustomerLocatioins()
    await seedLanePartners()
    await seedLanes()
    await seedTeams()
    await seedTeammates()
    await seedMessages()
}

setUp()


