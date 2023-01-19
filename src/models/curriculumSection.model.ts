module.exports = (sequelize, Sequelize) => {
  const CurriculumSection = sequelize.define(
    'CurriculumSection',
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
      objective: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  CurriculumSection.associate = (models) => {
    CurriculumSection.belongsTo(models.Course, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });

    CurriculumSection.hasMany(models.CurriCulumVideo, {
      foreignKey: 'curriculum_id',
      targetKey: 'id',
    });
    CurriculumSection.hasMany(models.Quiz, {
      foreignKey: 'curriculum_id',
      targetKey: 'id',
    })
  };
  return CurriculumSection;
};
