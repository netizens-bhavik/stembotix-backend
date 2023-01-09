module.exports = (sequelize, Sequelize) => {
  const QuizAns = sequelize.define(
    'QuizAns',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      option: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  QuizAns.associate = (models) => {
    QuizAns.belongsTo(models.QuizQue, {
      foreignKey: 'quizQue_id',
      targetKey: 'id',
    });
  };

  return QuizAns;
};
