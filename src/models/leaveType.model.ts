module.exports = (sequelize, Sequelize) => {
  const LeaveTypes = sequelize.define(
    'LeaveTypes',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      LeaveName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      LeaveDescription: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      Type: {
        type: Sequelize.ENUM('Sick', 'Paid', 'Unpaid'),
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  LeaveTypes.associate = (models) => {
    LeaveTypes.hasMany(models.InstructorHasLeave, {
      foreignKey: 'LeaveTypeId',
      sourceKey: 'id',
      as: 'LeaveType',
    });
    LeaveTypes.hasMany(models.ManageLeaves, {
      foreignKey: 'LeaveTypeId',
      sourceKey: 'id',
    });
  };
  return LeaveTypes;
};
