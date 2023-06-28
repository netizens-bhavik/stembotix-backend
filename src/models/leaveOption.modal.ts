module.exports = (sequelize, Sequelize) => {
  const LeaveOption = sequelize.define(
    'LeaveOption',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      option: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  LeaveOption.associate = (models) => {
    LeaveOption.hasMany(models.LeaveTypes, {
      foreignKey: 'leaveOptionId',
      sourceKey: 'id',
    });
  };
  return LeaveOption;
};
