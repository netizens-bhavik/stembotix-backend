module.exports = (sequelize, Sequelize) => {
  const LiveStreamChatLogs = sequelize.define(
    'LiveStreamChatLogs',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      isOnline: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      socketId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  LiveStreamChatLogs.associate = (models) => {
    LiveStreamChatLogs.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    LiveStreamChatLogs.belongsTo(models.LiveStream, {
      foreignKey: 'livestreamId',
      targetKey: 'id',
    });
    LiveStreamChatLogs.belongsTo(models.SubscribeEvent, {
      foreignKey: 'subscribeEventId',
      targetKey: 'id',
    });
  };
  return LiveStreamChatLogs;
};
