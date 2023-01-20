module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'QuizScore',
      'completeQuiz',
      Sequelize.DataTypes.STRING
    );
  },
  async down(queryInterface) {
    return queryInterface.removeColumn('QuizScore', 'completeQuiz');
  },
};
