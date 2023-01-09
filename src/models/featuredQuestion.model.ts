module.exports = (sequelize, Sequelize) => {
  const FeaturedQuestion = sequelize.define(
    'FeaturedQuestion',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      question: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      up_voted: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  FeaturedQuestion.associate = (models) => {
    FeaturedQuestion.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
    FeaturedQuestion.belongsTo(models.Course, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    FeaturedQuestion.hasMany(models.FeaturedAnswer, {
      foreignKey: 'feat_que_id',
      targetKey: 'id',
    });
  };
  return FeaturedQuestion;
};
