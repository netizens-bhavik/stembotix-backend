module.exports = (sequelize, Sequelize) => {
  const HolidayList = sequelize.define(
    'HolidayList',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: [
          'Public Holiday',
          'Private Holiday',
          'Restricted Holiday',
          'Other Holiday',
        ],
        allowNull: false,
        defaultValue: 'Public Holiday',
      },
    },
    { paranoid: true }
  );
  HolidayList.associate = (models) => {
    HolidayList.hasMany(models.Holidays, {
      foreignKey: 'holidayListId',
      as: 'holidays',
    });
  };
  return HolidayList;
};
