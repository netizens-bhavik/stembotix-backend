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
      // completeQuiz: {
      //   type: Sequelize.STRING,
      //   allowNull: false,
      // },
    },
    {
      paranoid: true,
    }
  );
  Quiz.associate = (models) => {
    Quiz.belongsTo(models.CurriculumSection, {
      foreignKey: 'curriculum_id',
      targetKey: 'id',
    });
    Quiz.hasMany(models.QuizQue, {
      foreignKey: 'quiz_id',
      targetKey: 'id',
    });
    Quiz.hasMany(models.QuizScore, {
      foreignKey: 'quiz_id',
      targetKey: 'id',
    });
  };
  return Quiz;
};
