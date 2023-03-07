module.exports = (sequelize, Sequelize) => {
  const Holidays = sequelize.define(
    'Holidays',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  Holidays.associate = (models) => {
    Holidays.belongsTo(models.HolidayList, {
      foreignKey: 'holidayListId',
      as: 'holidayList',
    });
    Holidays.belongsTo(models.User, {
      foreignKey: 'instituteId',
      targetKey: 'id',
    });
  };
  return Holidays;
};
