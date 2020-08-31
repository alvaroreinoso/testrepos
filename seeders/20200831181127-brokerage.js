'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Brokerages', [{
      pin: '9983739',
      name: 'One Point',
      address: 'ten cherry lane',
      addres2: 'test',
      city: 'Nashville',
      state: 'TN',
      zipcode: '32456',
      phone: '1-615-845-9029',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {


    await queryInterface.bulkDelete('Brokerages', null, {});

  }
};
