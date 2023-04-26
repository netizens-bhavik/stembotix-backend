module.exports = (sequelize, Sequelize) => {
  const BlogTags = sequelize.define(
    'BlogTags',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tag_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { paranoid: true }
  );

  BlogTags.associate = (models) => {
    BlogTags.belongsToMany(models.Blog, {
      through: 'BlogBlogTag',
      foreignKey: 'blogTagId',
      otherKey: 'blogId',
    });
    BlogTags.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return BlogTags;
};
