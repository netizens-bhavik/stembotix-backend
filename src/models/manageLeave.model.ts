module.exports = (sequelize, Sequelize) => {
  const ManageLeaves = sequelize.define(
    'ManageLeaves',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      leaveReason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isApproved: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
    },
    { paranoid: true }
  );
  ManageLeaves.associate = (models) => {
    ManageLeaves.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    ManageLeaves.belongsTo(models.LiveStream, {
      foreignKey: 'livestreamId',
      targetKey: 'id',
    });

    ManageLeaves.belongsTo(models.LeaveTypes, {
      foreignKey: 'leaveTypeId',
      targetKey: 'id',
    });
  };
  return ManageLeaves;
};
