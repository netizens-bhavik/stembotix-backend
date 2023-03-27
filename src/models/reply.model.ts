module.exports = (sequelize, Sequelize) => {
  const Reply = sequelize.define(
    'Reply',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      reply: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
    },
    { paranoid: true }
  );
  Reply.associate = (models) => {
    Reply.belongsTo(models.Comment, {
      foreignKey: 'comment_id',
      targetKey: 'id',
    });
    Reply.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    Reply.hasMany(models.LikeDislike, {
      foreignKey: 'reply_id',
      targetKey: 'id',
    });
  };
  return Reply;
};
