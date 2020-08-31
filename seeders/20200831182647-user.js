'use strict';


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      username: 'jerryoates',
      brokerageId: 1,
      teamId: 1,
      title: 'CEO',
      firstName: 'Jerry',
      lastName: 'Oates',
      email: 'jerryoates1@gmail.com',
      phone: '901-299-1109',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Users', null, {});

  }
};
