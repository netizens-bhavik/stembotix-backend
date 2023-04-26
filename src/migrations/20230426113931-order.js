'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('Order', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('Order', 'email', {});
  },
};
