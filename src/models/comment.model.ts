module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define(
    'Comment',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
    },
    { paranoid: true }
  );
  Comment.associate = (models) => {
    Comment.belongsTo(models.Course, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    Comment.hasMany(models.Reply);
  };
  return Comment;
};
