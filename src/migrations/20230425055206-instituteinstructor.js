module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('InstituteInstructor', 'email');
  },

  async down(queryInterface, Sequelize) {
    queryInterface.addColumn('InstituteInstructor', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    });
  },
};
