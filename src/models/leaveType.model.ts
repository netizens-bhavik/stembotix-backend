module.exports = (sequelize, Sequelize) => {
  const LeaveTypes = sequelize.define(
    'LeaveTypes',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      leaveName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      leaveDescription: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('Sick', 'Paid', 'Unpaid'),
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  LeaveTypes.associate = (models) => {
    LeaveTypes.hasMany(models.InstructorHasLeave, {
      foreignKey: 'leaveTypeId',
      sourceKey: 'id',
    });
    LeaveTypes.hasMany(models.ManageLeaves, {
      foreignKey: 'leaveTypeId',
      sourceKey: 'id',
    });
  };
  return LeaveTypes;
};
