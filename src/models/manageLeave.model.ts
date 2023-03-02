module.exports = (sequelize, Sequelize) => {
  const ManageLeaves = sequelize.define(
    'ManageLeaves',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      Date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      LeaveReason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      LeaveType: {
        type: Sequelize.ENUM('Sick', 'Paid', 'Unpaid'),
        allowNull: false,
        defaultValue: 'Casual',
      },
      isApproved: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      isInstructor: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isStudent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { paranoid: true }
  );
  ManageLeaves.associate = (models) => {
    ManageLeaves.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'ManageUserLeave',
    });
    ManageLeaves.belongsTo(models.LiveStream, {
      foreignKey: 'livestreamId',
      targetKey: 'id',
    });
    // ManageLeaves.belongsTo(models.User, {
    //   foreignKey: 'LeaveId',
    //   targetKey: 'id',
    //   as: 'Leave',
    // });
  };
  return ManageLeaves;
};
