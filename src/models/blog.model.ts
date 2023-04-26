module.exports = (sequelize, Sequelize) => {
  const Blog = sequelize.define(
    'Blog',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      meta: {
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSON,
      },
    },
    { paranoid: true }
  );

  Blog.associate = (models) => {
    Blog.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });

    Blog.belongsToMany(models.BlogTags, {
      through: 'BlogBlogTag',
      foreignKey: 'blogId',
      otherKey: 'blogTagId',
    });
    Blog.belongsTo(models.BlogCategory, {
      foreignKey: 'blogCatId',
      targetKey: 'id',
    });
    Blog.hasMany(models.BlogReview, {
      foreignKey: 'blogId',
      targetKey: 'id',
    });
  };
  return Blog;
};
