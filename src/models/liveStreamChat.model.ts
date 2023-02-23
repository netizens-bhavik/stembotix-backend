module.exports = (sequelize, Sequelize) => {
  const LiveStreamChat = sequelize.define(
    'LiveStreamChat',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      // messagesType: {
      //   type: Sequelize.ENUM,
      //   values: ['text', 'image', 'video', 'audio'],
      //   allowNull: false,
      //   defaultValue: 'text',
      // },
      messages: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    { paranoid: true }
  );
  LiveStreamChat.associate = (models) => {
    LiveStreamChat.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    LiveStreamChat.belongsTo(models.SubscribeEvent, {
      foreignKey: 'subscribeEventId',
      targetKey: 'id',
    });
    LiveStreamChat.belongsTo(models.LiveStream, {
      foreignKey: 'livestreamId',
      targetKey: 'id',
    });
  };
  return LiveStreamChat;
};
