'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.removeColumn('Course', 'price',Sequelize.FLOAT,{
      allowNull:true
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.addColumn('Course', 'price',Sequelize.DECIMAL(10,2),{
      allowNull:true

    });
  }
};
