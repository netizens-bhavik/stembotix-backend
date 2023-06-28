module.exports = (sequelize, Sequelize) => {
  const LiveStreamCat = sequelize.define(
    'LiveStreamCat',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { paranoid: true }
  );
  LiveStreamCat.associate = (models) => {
    LiveStreamCat.hasMany(models.LiveStream, {
      foreignKey: 'categoryId',
      targetKey: 'id',
    });
  };
  return LiveStreamCat;
};
