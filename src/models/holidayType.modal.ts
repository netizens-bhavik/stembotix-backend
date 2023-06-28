module.exports = (sequelize, Sequelize) => {
  const HolidayType = sequelize.define(
    'HolidayType',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  HolidayType.associate = (models) => {
    HolidayType.hasMany(models.HolidayList, {
      foreignKey: 'typeId',
      sourceKey: 'id',
    });
  };
  return HolidayType;
};
