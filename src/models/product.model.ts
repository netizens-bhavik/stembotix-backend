module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM(['Uncategorized', 'Mechanical']),
        defaultValue: 'Uncategorized',
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM(['Drafted', 'Published']),
        defaultValue: 'Drafted',
      },
      description: {
        type: Sequelize.TEXT,
        afllowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  Product.associate = (models) => {
    Product.hasMany(models.ProductTagMap, {
      foreignKey: 'product_id',
      sourceKey: 'id',
    });
    Product.hasOne(models.ProductDimensionMap, {
      foreignKey: 'product_id',
      sourceKey: 'id',
    });
    Product.belongsToMany(models.User, {
      through: 'ProductUser',
      foreignKey: 'product_id',
      otherKey: 'userId',
    });
    Product.hasOne(models.CartItem);
  };
  return Product;
};
