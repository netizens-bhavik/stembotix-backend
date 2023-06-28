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
    },
    { paranoid: true }
  );
  HolidayList.associate = (models) => {
    HolidayList.hasMany(models.Holidays, {
      foreignKey: 'holidayListId',
      as: 'holidays',
    });
    HolidayList.belongsTo(models.HolidayType, {
      foreignKey: 'typeId',
      sourceKey: 'id',
    });
  };
  return HolidayList;
};
