module.exports = (sequelize, Sequelize) => {
  const PaymentGatewaySettings = sequelize.define(
    'PaymentGatewaySettings',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      meta: {
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSON,
      },
    },
    {
      paranoid: true,
    }
  );
  PaymentGatewaySettings.associate = (models) => {
    PaymentGatewaySettings.belongsTo(models.PaymentGateway, {
      foreignKey: 'paymentGId',
      targetKey: 'id',
    });
  };
  return PaymentGatewaySettings;
};
