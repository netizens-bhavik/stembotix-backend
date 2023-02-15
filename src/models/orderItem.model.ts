module.exports = (sequelize, Sequelize) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      item_type: {
        type: Sequelize.ENUM(['Product', 'Course']),
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
    },
    {
      paranoid: true,
    }
  );
  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order); // Order.hasMany(models.OrderItem)
    OrderItem.belongsTo(models.Course, {
      foreignKey: {
        allowNull: true,
      },
    });
    OrderItem.belongsTo(models.Product, {
      foreignKey: {
        allowNull: true,
      },
    });
  };
  return OrderItem;
};
