module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      amount: {
        type: Sequelize.INTEGER,
      },
      payment_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      razorpay_order_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      razorpay_signature: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
    }
  );
  Order.associate = (models) => {
    Order.belongsTo(models.User);
    Order.hasMany(models.OrderItem);
  };
  return Order;
};
