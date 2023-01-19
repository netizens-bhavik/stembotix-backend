module.exports = (sequelize, Sequelize) => {
  const CartItem = sequelize.define(
    'CartItem',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      item_type: {
        type: Sequelize.ENUM(["Product", "Course"]),
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
  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart);
    CartItem.belongsTo(models.Course, {
      foreignKey: {
        name: 'course_id',
        allowNull: true,
      },
    });
    CartItem.belongsTo(models.Product, {
      foreignKey: {
        name: 'product_id',
        allowNull: true,
      },
    });
  };
  return CartItem;
};
