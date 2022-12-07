module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define(
    "Course",
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
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      level: {
        type: Sequelize.ENUM([
          "Beginner",
          "Intermediate",
          "Advanced",
          "All levels",
        ]),
        defaultValue: "All levels",
      },
      language: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM(["Drafted", "Published"]),
        defaultValue: "Drafted",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
    },
    {
      paranoid: true,
    }
  );

  Course.associate = (models) => {
    Course.belongsToMany(models.Trainer, {
      through: "CoursesTrainers",
      foreignKey: "course_id",
      otherKey: "trainer_id",
    });
  };
  return Course;
};
