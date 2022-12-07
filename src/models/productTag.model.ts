module.exports = (sequelize, Sequelize) => {
  const ProductTagMap = sequelize.define(
    'ProductTagMap',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  )
  ProductTagMap.associate = (models) => {
    ProductTagMap.belongsTo(models.Product, {
      foreignKey: 'product_id',
      sourceKey: 'id',
    })
  }
  return ProductTagMap
}
