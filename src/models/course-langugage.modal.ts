module.exports = (sequelize, Sequelize) => {
  const CourseLanguage = sequelize.define(
    'CourseLanguage',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      language: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { paranoid: true }
  );
  CourseLanguage.associate = (models) => {
    CourseLanguage.hasMany(models.Course, {
      foreignKey: 'courseLanguageId',
      targetKey: 'id',
    });
  };
  return CourseLanguage;
};
