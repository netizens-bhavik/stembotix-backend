module.exports = (sequelize, Sequelize) => {
  const Contact = sequelize.define(
    'Contact',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address',
          },
        },
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allownull: true,
      },
    },
    { paranoid: true }
  );

  Contact.associate = (models) => {
    Contact.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };
  return Contact;
};
