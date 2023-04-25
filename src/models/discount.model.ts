module.exports = (sequelize, Sequelize) => {
  const DiscountCode = sequelize.define(
    'DiscountCode',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      couponCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      discount: {
        type: Sequelize.STRING,
        value: {
          type: Sequelize.DECIMAL(10, 2),
        },
      },
    },
    { paranoid: true }
  );
  DiscountCode.associate = (models) => {
    DiscountCode.belongsToMany(models.User, {
      through: 'Discount',
      foreignKey: 'discountCoupon_id',
      otherKey: 'userId',
    });
  };
  return DiscountCode;
};
