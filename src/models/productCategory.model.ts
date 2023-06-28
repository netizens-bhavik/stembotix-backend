module.exports = (sequelize, Sequelize) => {
  const ProductCategory = sequelize.define(
    'ProductCategory',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { paranoid: true }
  );
  ProductCategory.associate = (models) => {
    ProductCategory.hasMany(models.Product, {
      foreignKey: 'categoryId',
      targetKey: 'id',
    });
  };
  return ProductCategory;
};
