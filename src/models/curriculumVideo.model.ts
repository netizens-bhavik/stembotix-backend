module.exports = (sequelize, Sequelize) => {
  const CurriCulumVideo = sequelize.define(
    'CurriCulumVideo',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  CurriCulumVideo.associate = (models) => {
    CurriCulumVideo.belongsTo(models.CurriculumSection, {
      foreignKey: 'curriculum_id',
      targetKey: 'id',
    });
  };
  return CurriCulumVideo;
};
