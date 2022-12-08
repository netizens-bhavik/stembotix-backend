module.exports = (sequelize, Sequelize) => {
  const Trainer = sequelize.define(
    'Trainer',
    {
      trainer_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );

  Trainer.associate = (models) => {
    Trainer.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    Trainer.belongsToMany(models.Course, {
      through: 'CoursesTrainers',
      foreignKey: 'trainer_id',
      otherKey: 'course_id',
    });
  };

  return Trainer;
};
