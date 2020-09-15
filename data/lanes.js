const faker = require('faker');

const lanes = [...Array(50)].map((lane) => (
    {
      origin: faker.address.city(),
      destination: faker.address.city(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
))

module.exports = lanes