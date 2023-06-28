module.exports = (sequelize, Sequelize) => {
  const CourseLevel = sequelize.define(
    'CourseLevel',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      level: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { paranoid: true }
  );
  CourseLevel.associate = (models) => {
    CourseLevel.hasMany(models.Course, {
      foreignKey: 'courseLevelId',
      targetKey: 'id',
    });
  };
  return CourseLevel;
};
