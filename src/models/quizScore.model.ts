module.exports = (sequelize, Sequelize) => {
  const QuizScore = sequelize.define(
    'QuizScore',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      totalQue: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  QuizScore.associate = (models) => {
    QuizScore.belongsTo(models.Quiz, {
      foreignKey: 'quiz_id',
      targetKey: 'id',
    });
    QuizScore.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return QuizScore;
};
