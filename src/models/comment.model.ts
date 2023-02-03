import DB from "@/databases";

module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define(
    'Comment',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { paranoid: true }
  );
  // Comment.getLike = async function () {
  //   return DB.LikeDislike;
  // };
  // LikeDislike.findAll({
  //   where:{

  //   }
  // })
  Comment.associate = (models) => {
    Comment.belongsTo(models.Course, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    Comment.hasMany(models.Reply, {
      foreignKey: 'comment_id',
      targetKey: 'id',
    });
    Comment.hasMany(models.LikeDislike, {
      foreignKey: 'comment_id',
      targetKey: 'id',
    });
  };
  return Comment;
};
