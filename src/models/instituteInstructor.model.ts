module.exports = (sequelize, Sequelize) => {
  const InstituteInstructor = sequelize.define(
    'InstituteInstructor',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      isAccepted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { paranoid: true }
  );
  InstituteInstructor.associate = (models) => {
    InstituteInstructor.belongsTo(models.User, {
      foreignKey: 'InstructorId',
      targetKey: 'id',
      as: 'instructor',
    });
    InstituteInstructor.belongsTo(models.User, {
      foreignKey: 'InstituteId',
      targetKey: 'id',
      as: 'institute',
    });
  };
  return InstituteInstructor;
};
