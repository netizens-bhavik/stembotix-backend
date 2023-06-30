module.exports = (sequelize, Sequelize) => {
  const UserSubscribe = sequelize.define(
    'UserSubscribe',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address',
          },
        },
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

  UserSubscribe.associate = (models) => {
    UserSubscribe.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };

  return UserSubscribe;
};
