module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      roleName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
    },
    {
      paranoid: true,
    }
  );
  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: "role_id",
      sourceKey: "id",
    });
  };
  return Role;
};
