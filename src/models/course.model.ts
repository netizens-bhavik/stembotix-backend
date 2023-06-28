module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define(
    'Course',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(['Drafted', 'Published']),
        defaultValue: 'Drafted',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
      trailer: {
        type: Sequelize.STRING,
      },
    },
    {
      paranoid: true,
    }
  );

  Course.associate = (models) => {
    Course.hasMany(models.CurriculumSection, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Course.belongsToMany(models.Trainer, {
      through: 'CoursesTrainers',
      foreignKey: 'course_id',
      otherKey: 'trainer_id',
    });
    Course.hasMany(models.Review, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Course.hasMany(models.Comment, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Course.hasOne(models.CartItem);
    Course.hasMany(models.Comment, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Course.hasMany(models.OrderItem);
    Course.belongsTo(models.CourseType, {
      foreignKey: 'coursetypeId',
      targetKey: 'id',
    });
    Course.hasMany(models.CouponCode, {
      foreignKey: 'course_id',
      targetKey: 'id',
    });
    Course.belongsTo(models.CourseLevel, {
      foreignKey: 'courseLevelId',
      targetKey: 'id',
    });
    Course.belongsTo(models.CourseLanguage, {
      foreignKey: 'courseLanguageId',
      targetKey: 'id',
    });
  };

  return Course;
};
