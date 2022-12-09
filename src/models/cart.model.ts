module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define(
    'Cart',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      paranoid: true,
    }
  );
  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });

    Cart.hasMany(models.CartItem);
  };
  return Cart;
};
