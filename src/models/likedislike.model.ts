module.exports = (sequelize, Sequelize) => {
  const LikeDislike = sequelize.define(
    'LikeDislike',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },

    { paranoid: true }
  );
  LikeDislike.associate = (models) => {
    LikeDislike.belongsTo(models.Comment, {
      foreignKey: 'comment_id',
      targetKey: 'id',
    });
    LikeDislike.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
  };
  return LikeDislike;
};
