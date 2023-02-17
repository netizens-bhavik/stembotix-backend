module.exports = (sequelize, Sequelize) => {
  const Livestream = sequelize.define(
    'LiveStream',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      subscriptionPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categories: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  Livestream.associate = (models) => {
    Livestream.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return Livestream;
};
