module.exports = (sequelize, Sequelize) => {
  const PrivacyPolicy = sequelize.define(
    'PrivacyPolicy',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  PrivacyPolicy.associate = (models) => {};
  return PrivacyPolicy;
};
