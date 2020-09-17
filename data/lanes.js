const faker = require('faker');

const lanes = [
    {
      origin: 'Chino CA',
      destination: 'Nashville TN',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      origin: 'Chino CA',
      destination: 'Morganton KY',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      origin: 'Chino CA',
      destination: faker.address.city(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      origin: faker.address.city(),
      destination: faker.address.city(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      origin: faker.address.city(),
      destination: faker.address.city(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
]
   
module.exports = lanes