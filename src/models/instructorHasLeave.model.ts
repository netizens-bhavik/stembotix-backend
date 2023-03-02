module.exports = (sequelize, Sequelize) => {
  const InstructorHasLeave = sequelize.define(
    'InstructorHasLeave',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      LeaveCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    { paranoid: true }
  );
  InstructorHasLeave.associate = (models) => {
    InstructorHasLeave.belongsTo(models.InstituteInstructor, {
      foreignKey: 'InstituteInstructorId',
      targetKey: 'id',
      as: 'InstructorLeave',
    });
    InstructorHasLeave.belongsTo(models.LeaveTypes, {
      foreignKey: 'LeaveTypeId',
      targetKey: 'id',
      as: 'LeaveType',
    });
  };
  return InstructorHasLeave;
};
