module.exports = (sequelize, Sequelize) => {
  const InstructorHasLeave = sequelize.define(
    'InstructorHasLeave',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      leaveCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    { paranoid: true }
  );
  InstructorHasLeave.associate = (models) => {
    InstructorHasLeave.belongsTo(models.InstituteInstructor, {
      foreignKey: 'instituteInstructorId',
      targetKey: 'id',
    });
    InstructorHasLeave.belongsTo(models.LeaveTypes, {
      foreignKey: 'leaveTypeId',
      targetKey: 'id',
    });
  };
  return InstructorHasLeave;
};
