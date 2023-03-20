module.exports = (sequelize, Sequelize) => {
    const AttemptQuizQue = sequelize.define(
      'AttemptQuizQue',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        isAttempted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      },
      { paranoid: true }
    );
    AttemptQuizQue.associate = (models) => {
        AttemptQuizQue.belongsTo(models.QuizQue, {
        foreignKey: 'quiz_que_id',
        targetKey: 'id',
      });
      AttemptQuizQue.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
      });
      AttemptQuizQue.belongsTo(models.Quiz, {
        foreignKey: 'quiz_id',
        targetKey: 'id',
      });
    };
    return AttemptQuizQue;
  };
  