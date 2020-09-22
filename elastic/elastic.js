var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7', // use the same version of your Elasticsearch instance
});

const { Customer, Lane, LanePartner, User } = require('.././models');
const lane = require('../models/lane');

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});


// Create elasticsearch instance - DONE

// find best way to index necessary data programmatically

// keep data in sync with db

// restric query results by user and team access

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
                }
            }
        }
    })

    // const customers = await Customer.findAll({
    //     include: [{
    //         model: User,
    //         required: true,
    //         keys: userId
    //     }]
    // })

    customers.forEach((cust) => {
        client.create({
            index: 'customer',
            id: cust.id,
            body: {
                name: cust.name,
                industry: cust.industry,
                userId: cust.userId,
                teamId: cust.teamId
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
                    destination: { "type": "text" }
                }
            }
        }
    })

    const lanes = await Lane.findAll()

    lanes.forEach((lane) => {
        client.create({
            index: 'lane',
            id: lane.id,
            body: {
                origin: lane.origin,
                destination: lane.destination
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
                    email: { "type": "text" }
                }
            }
        }
    })

    const lanePartners = await LanePartner.findAll({
        include: [{
            models
        }]
    })

    lanePartners.forEach((partner) => {
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
                email: partner.email
            }
        })
    })
}


async function setUp() {
//     await seedLanePartners()
//     await seedLanes()
//     await seedCustomer()
}

setUp()


