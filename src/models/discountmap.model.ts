module.exports = (sequelize, Sequelize) => {
  const DiscountCouponMap = sequelize.define(
    'DiscountCouponMap',
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
  DiscountCouponMap.associate = (models) => {
    DiscountCouponMap.belongsTo(models.Cart, {
      foreignKey: 'cart_id',
      sourceKey: 'id',
    });
    DiscountCouponMap.belongsTo(models.DiscountCode, {
      foreignKey: 'discountCouponId',
      sourceKey: 'id',
    });
  };
  return DiscountCouponMap;
};
