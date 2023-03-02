module.exports = (sequelize, Sequelize) => {
  const CourseType = sequelize.define('CourseType', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    course_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
  },
  { paranoid: true }
  );
  CourseType.associate = (models)=>{
    CourseType.belongsTo(models.User,{
        foreignKey:'userId',
        targetKey:'id'
    })
  }
  return CourseType;
};
