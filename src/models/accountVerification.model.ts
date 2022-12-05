module.exports = (sequelize, Sequelize) => {
  const AccountVerification = sequelize.define(
    "AccountVerification",
    {
      hash: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  AccountVerification.associate = (models) => {
    AccountVerification.belongsTo(models.User, {
      foreignKey: "id",
      sourceKey: "user_id",
    });
  };
  return AccountVerification;
};
