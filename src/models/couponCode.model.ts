module.exports = (sequelize, Sequelize) => {
  const CouponCode = sequelize.define('CouponCode', {
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
    flat: {
      type: Sequelize.STRING,
      defaultValue: '100%',
    },
    discount: {
      type: Sequelize.STRING,
      value: {
        type: Sequelize.DECIMAL(10, 2),
      },
    },
  });
  CouponCode.associate = (models) => {
    CouponCode.belongsTo(models.User, {
      foreignKey: 'instructorId',
      targetKey: 'id',
      as: 'Instructor',
    });
    CouponCode.belongsTo(models.User, {
      foreignKey: 'instituteId',
      targetKey: 'id',
      as: 'Institute',
    });
    CouponCode.belongsTo(models.Course, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    CouponCode.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return CouponCode;
};
