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
    InstructorHasLeave.belongsTo(models.InstituteInstructor, {
      foreignKey: 'InstituteInstructorId',
      targetKey: 'id',
      as: 'InstructorLeave',
    });
  };
  return InstructorHasLeave;
};
