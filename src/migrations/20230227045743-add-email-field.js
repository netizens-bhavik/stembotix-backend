'use strict';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {

    queryInterface.addColumn('InstituteInstructor', 'email',Sequelize.STRING,{
      allowNull:false,
      unique:true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    });
  },

  async down (queryInterface) {

    queryInterface.removeColumn("InstituteInstructor",'email') 
  }
};
