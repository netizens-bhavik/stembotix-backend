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
        allowNull: false,
        unique: true,
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
    },
    { paranoid: true }
  );
  InstituteInstructor.associate = (models) => {
    InstituteInstructor.belongsTo(models.User, {
      foreignKey: 'InstructorId',
      targetKey: 'id',
      as: 'Instructor',
    });
    InstituteInstructor.belongsTo(models.User, {
      foreignKey: 'InstituteId',
      targetKey: 'id',
      as: 'Institute',
    });
    InstituteInstructor.belongsTo(models.InstructorHasLeave, {
      foreignKey: 'InstructorId',
      targetKey: 'id',
      as: 'InstructorLeave',
    });
  };
  return InstituteInstructor;
};
