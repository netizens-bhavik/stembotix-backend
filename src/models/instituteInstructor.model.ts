module.exports = (sequelize, Sequelize) => {
  const InstituteInstructor = sequelize.define(
    'InstituteInstructor',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      proposal: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address',
          },
        },
      },
      isAccepted: {
        type: Sequelize.ENUM('Pending', 'Accepted', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    { paranoid: true }
  );
  InstituteInstructor.associate = (models) => {
    InstituteInstructor.belongsTo(models.User, {
      foreignKey: 'instructorId',
      targetKey: 'id',
      as: 'Instructor',
    });
    InstituteInstructor.belongsTo(models.User, {
      foreignKey: 'instituteId',
      targetKey: 'id',
      as: 'Institute',
    });
    InstituteInstructor.hasMany(models.InstructorHasLeave, {
      foreignKey: 'instituteInstructorId',
      sourceKey: 'id',
    });
  };
  return InstituteInstructor;
};
