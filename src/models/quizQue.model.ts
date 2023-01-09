module.exports = (sequelize, Sequelize) => {
  const QuizQue = sequelize.define(
    'QuizQue',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      question: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  QuizQue.associate = (models) => {
    QuizQue.belongsTo(models.Quiz, {
      foreignKey: 'quiz_id',
      targetKey: 'id',
    });
    QuizQue.hasMany(models.QuizAns);
  };
  return QuizQue;
};
