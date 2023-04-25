module.exports = (sequelize, Sequelize) => {
  const BlogCategory = sequelize.define(
    'BlogCategory',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      cat_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { paranoid: true }
  );

  BlogCategory.associate = (models) => {
    BlogCategory.hasMany(models.Blog, {
      foreignKey: 'blogCatId',
      targetKey: 'id',
    });
    BlogCategory.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return BlogCategory;
};
