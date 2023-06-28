'use strict';

const { STRING } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Remove the type column from the HolidayList table
    await queryInterface.removeColumn('HolidayList', 'type', STRING);

    // Step 2: Add the typeId column to the HolidayList table
    await queryInterface.addColumn('HolidayList', 'type_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'HolidayType',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Step 1: Add back the type column to the HolidayList table
    await queryInterface.addColumn('HolidayList', 'type', {
      type: Sequelize.ENUM([
        'Public Holiday',
        'Private Holiday',
        'Restricted Holiday',
        'Other Holiday',
      ]),
      allowNull: false,
      defaultValue: 'Public Holiday',
    });

    // Step 2: Remove the typeId column from the HolidayList table
    await queryInterface.removeColumn('HolidayList', 'type_id');
  },
};
