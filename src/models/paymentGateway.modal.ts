module.exports = (sequelize, Sequelize) => {
  const PaymentGateway = sequelize.define(
    'PaymentGateway',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      logo: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      meta: {
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSON,
      },
      isActive: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  PaymentGateway.associate = (models) => {
    PaymentGateway.hasMany(models.PaymentGatewaySettings, {
      foreignKey: 'paymentGId',
      targetKey: 'id',
    });
  };
  return PaymentGateway;
};
