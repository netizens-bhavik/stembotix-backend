'use strict';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {

    queryInterface.removeColumn('Comment', 'thumbnail',Sequelize.STRING,{
      allowNull:true
    });
  },

  async down (queryInterface) {

    queryInterface.dropTable("Comment") 
  }
};
