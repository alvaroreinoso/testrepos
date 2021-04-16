const stateAbbreviations = require('states-abbreviations')
const { Customer, Brokerage, Contact, Lane, LanePartner, Team, Location, CustomerLocation, User, Message, Ledger } = require('.././models');
const client = require('./client')

client.ping((err) => {
    if (err) {
        console.trace('cluster is down maybe')
    } else {
        console.log('All is well')
    }
})

async function seedBrokerages() {

    await client.indices.create({
        index: 'brokerage'
    })

    const brokerages = await Brokerage.findAll()

    const brokerageDocs = await brokerages.map(brokerage => {
        const brokerageDoc = {
            id: brokerage.id,
            name: brokerage.name,
            brokerageId: brokerage.id,
        }

        return brokerageDoc
    })

    const result = await client.helpers.bulk({
        datasource: brokerageDocs,
        onDocument(doc) {
            return {
                index: { _index: 'brokerage', _id: doc.id },
                id: doc.id
            }
        }
    })

    console.log('Brokerages: ', result)
}

async function seedCustomer() {

    await client.indices.create({
        index: 'customer',
    })

    const customers = await Customer.findAll({
        attributes: ['name', 'brokerageId', 'id']
    })

    const result = await client.helpers.bulk({
        datasource: customers,
        onDocument(doc) {
            return {
                index: { _index: 'customer', _id: doc.id },
            }
        }
    })

    console.log('Customers: ', result)
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

    const messageDocs = await messages.map(message => {
        const messageDoc = {
            id: message.id,
            content: message.content,
            ledgerId: message.ledgerId,
            brokerageId: message.Ledger.brokerageId,
            userFirstName: message.User.firstName,
            userLastName: message.User.lastName
        }

        return messageDoc
    })

    const result = await client.helpers.bulk({
        datasource: messageDocs,
        onDocument(doc) {
            return {
                index: { _index: 'message', _id: doc.id },
                id: doc.id
            }
        }
    })

    console.log('Messages: ', result)
}

async function seedLanes() {

    await client.indices.create({
        index: 'lane',
    })

    const lanes = await Lane.findAll()

    const laneDocs = await lanes.map(async (lane) => {

        const origin = await lane.getOrigin()
        const destination = await lane.getDestination()
        const ledger = await lane.getLedger()

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
            brokerageId: ledger.brokerageId
        }

        return body
    })

    const result = await client.helpers.bulk({
        datasource: laneDocs,
        onDocument(doc) {
            return {
                index: { _index: 'lane', _id: doc.id }
            }
        }
    })

    console.log('Lanes: ', result)

}

async function seedTeams() {

    await client.indices.create({
        index: 'team',
    })

    const teams = await Team.findAll({
        attributes: ['id', 'name', 'brokerageId', 'icon']
    })

    const result = await client.helpers.bulk({
        datasource: teams,
        onDocument(doc) {
            return {
                index: { _index: 'team', _id: doc.id }
            }
        }
    })

    console.log('Teams: ', result)
}

async function seedLanePartners() {

    await client.indices.create({
        index: 'lane_partner',
    })

    const partners = await LanePartner.findAll()

    const partnerDocs = await partners.map(async (partner) => {

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

        return lanePartner
    })

    const result = await client.helpers.bulk({
        datasource: partnerDocs,
        onDocument(doc) {
            return {
                index: { _index: 'lane_partner', _id: doc.id },
            }
        }
    })

    console.log('Lane Partners: ', result)
}

async function seedCustomerLocations() {

    await client.indices.create({
        index: 'customer_location',
    })

    const customerLocations = await CustomerLocation.findAll()

    const cLDocs = await customerLocations.map(async (cLocation) => {

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

        return customerLocation
    })

    const result = await client.helpers.bulk({
        datasource: cLDocs,
        onDocument(doc) {
            return {
                index: { _index: 'customer_location', _id: doc.id },
            }
        }
    })

    console.log('Customer Locations: ', result)
}

async function seedUsers() {

    await client.indices.create({
        index: 'user',
    })

    const users = await User.findAll({
        attributes: ['id', 'title', 'firstName', 'lastName', 'fullName', 'email', 'phone', 'brokerageId']
    })

    const result = await client.helpers.bulk({
        datasource: users,
        onDocument(doc) {
            return {
                index: { _index: 'user', _id: doc.id },
            }
        }
    })

    console.log('Users: ', result)
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

    const contactDocs = await contacts.map((contact) => {

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

        return doc
    })

    const result = await client.helpers.bulk({
        datasource: contactDocs,
        onDocument(doc) {
            return {
                index: { _index: 'contact', _id: doc.id },
            }
        }
    })

    console.log('Contacts: ', result)

}


async function setUp() {

    await client.indices.delete({
        index: '*'
    })

    await seedBrokerages()
    await seedContacts()
    await seedCustomer()
    await seedCustomerLocations()
    await seedLanePartners()
    await seedLanes()
    await seedTeams()
    await seedUsers()
    await seedMessages()

    return
}

setUp()


