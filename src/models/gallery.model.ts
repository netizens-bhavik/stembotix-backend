module.exports = (sequelize, Sequelize) => {
  const Gallery = sequelize.define(
    'Gallery',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
    },
    {
      paranoid: true,
    }
  );
  return Gallery;
};
