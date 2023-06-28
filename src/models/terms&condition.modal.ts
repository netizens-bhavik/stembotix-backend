module.exports = (sequelize, Sequelize) => {
  const TermsCondition = sequelize.define(
    'TermsCondition',
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
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  TermsCondition.associate = (models) => {};
  return TermsCondition;
};
