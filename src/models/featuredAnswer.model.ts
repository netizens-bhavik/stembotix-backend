module.exports = (sequelize, Sequelize) => {
  const FeaturedAnswer = sequelize.define(
    'FeaturedAnswer',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      answer: {
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
  FeaturedAnswer.associate = (models) => {
    FeaturedAnswer.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
    FeaturedAnswer.belongsTo(models.FeaturedQuestion, {
      foreignKey: 'feat_que_id',
      targetKey: 'id',
    });
  };
  return FeaturedAnswer;
};
