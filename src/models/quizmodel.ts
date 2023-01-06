module.exports = (sequelize, Sequelize) => {
  const Quiz = sequelize.define(
    'Quiz',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,

      },
    },
    {
      paranoid: true,
    }
  );
  Quiz.associate = (models) => {
    Quiz.belongsTo(models.CurriculumSection, {
      foreignkey: 'curriculum_id',
      targetkey: 'id',
    });
    Quiz.hasMany(models.QuizQue);
  };
  return Quiz;
};
