'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('User', 'role', {
      type: Sequelize.STRING,
  })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('User', 'role')
  }
};
