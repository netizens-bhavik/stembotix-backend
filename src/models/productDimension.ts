module.exports = (sequelize, Sequelize) => {
  const ProductDimensionMap = sequelize.define(
    'ProductDimensionMap',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      weight: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dimension: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  )
  ProductDimensionMap.associate = (models) => {
    ProductDimensionMap.belongsTo(models.Product, {
      foreignKey: 'product_id',
      sourceKey: 'id',
    })
  }
  return ProductDimensionMap
}
