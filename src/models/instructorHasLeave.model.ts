module.exports = (sequelize, Sequelize) => {
  const InstructorHasLeave = sequelize.define(
    'InstructorHasLeave',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      SickLeaveCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      CasualLeaveCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      EarnedLeaveCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    { paranoid: true }
  );
  InstructorHasLeave.associate = (models) => {
    InstructorHasLeave.belongsTo(models.User, {
      foreignKey: 'UserId',
      targetKey: 'id',
      as: 'InstructorHasLeave',
    });
    // UserHasLeave.belongsTo(models.User, {
    //   foreignKey: 'LeaveId',
    //   targetKey: 'id',
    //   as: 'Leave',
    // });
  };
  return InstructorHasLeave;
};
