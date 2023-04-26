module.exports = (sequelize, Sequelize) => {
  const BlogReview = sequelize.define(
    'BlogReview',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      sender_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address',
          },
        },
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    { paranoid: true }
  );

  BlogReview.associate = (models) => {
    BlogReview.belongsTo(models.Blog, {
      foreignKey: 'blogId',
      targetKey: 'id',
    });
    BlogReview.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return BlogReview;
};
