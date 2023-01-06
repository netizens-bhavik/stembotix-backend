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
        allowNull:false
      },
    },
    { paranoid: true }
  );
  QuizQue.associate = (models) => {
    QuizQue.belongsTo(models.Quiz, {
      foreignkey: 'quiz_id',
      targetkey: 'id',
    });
    QuizQue.hasMany(models.QuizAns);
  };
  return QuizQue;
};
