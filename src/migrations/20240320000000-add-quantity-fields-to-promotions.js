'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('promotions', 'quantity_required', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('promotions', 'quantity_free', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('promotions', 'quantity_required');
    await queryInterface.removeColumn('promotions', 'quantity_free');
  }
}; 