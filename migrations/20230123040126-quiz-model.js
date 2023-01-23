'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'Quiz',
      'completeQuiz',
      Sequelize.DataTypes.BOOLEAN
    );
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('Quiz', 'completeQuiz');
  },
};
