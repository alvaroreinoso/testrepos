const { Customer, CustomerLocation, Lane, LanePartnerLocation, LanePartner, Brokerage, Team } = require('./models')

const models = [Customer, CustomerLocation, Lane, LanePartnerLocation, LanePartner]

const names = [Brokerage, Customer]
const addresses = [CustomerLocation, LanePartnerLocation]


const search = async (text) => {
    await names.forEach(x => x.findAll({
        where: {
            name: text
        }
    }).then(x => console.log(x)))

    await address.forEach(x => x.findAll({
        where: {
            address: text
        }

    })
}

run()

const searchables = [
    {
        Lane: name
    },
    {
        Customer: [name, address, address2,]
    }
]