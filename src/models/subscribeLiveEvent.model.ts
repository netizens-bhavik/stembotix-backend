import sequelize, { Sequelize } from 'sequelize';

module.exports = (sequelize, Sequelize) => {
  const SubscribeEvent = sequelize.define(
    'SubscribeEvent',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      subscriptionPrice: {
        type: Sequelize.DECIMAL(10, 2),
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
    { paranoid: true }
  );
  SubscribeEvent.associate = (models) => {
    SubscribeEvent.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    SubscribeEvent.belongsTo(models.LiveStream, {
      foreignKey: 'livestreamId',
      targetKey: 'id',
    });
    SubscribeEvent.hasMany(models.LiveStreamChat, {
      foreignKey: 'subscribeEventId',
      targetKey: 'id',
    });
  };
  return SubscribeEvent;
};
