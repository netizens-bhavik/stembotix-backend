import { NUMBER } from "sequelize";

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
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
      like:{
        type:Sequelize.INTEGER
      },
      dislike:{
        type:Sequelize.INTEGER
      }
    },
    { paranoid: true }
  );
  Reply.assocaite = (models) => {
    Reply.belongsTo(models.Comment, {
      foreignKey: 'comment_id',
      targetKey: 'id',
    });
    Reply.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });

  };
  return Reply;
};
