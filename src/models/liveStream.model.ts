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
      Date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categories: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
      },
    },
    { paranoid: true }
  );
  Livestream.associate = (models) => {
    Livestream.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    Livestream.hasMany(models.SubscribeEvent, {
      foreignKey: 'livestreamId',
      targetKey: 'id',
    });
    Livestream.hasMany(models.LiveStreamChat, {
      foreignKey: 'livestreamId',
      targetKey: 'id',
    });
  };
  return Livestream;
};
