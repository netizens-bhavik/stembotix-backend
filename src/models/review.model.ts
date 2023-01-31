module.exports = (sequelize, Sequelize) => {
  const Review = sequelize.define(
    'Review',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      review: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  Review.asociate = (models) => {
    Review.belongsTo(models.Course, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Review.belongsTo(models.Product, {
      foreignKey: 'product_id',
      targetKey: 'id',
    });
    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return Review;
};
