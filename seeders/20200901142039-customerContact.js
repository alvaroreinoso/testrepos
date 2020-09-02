'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('CustomerContacts', [{
      firstName: 'bill',
      lastName: 'jones',
      title: 'Manager',
      phone: '9012281918',
      phoneExt: '1',
      email: 'billjones@gmail.com',
      contactLevel: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('CustomerContacts', null, {});

  }
};
