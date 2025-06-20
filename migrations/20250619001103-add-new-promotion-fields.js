'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add price field to promotions table
    await queryInterface.addColumn('promotions', 'price', {
      type: Sequelize.FLOAT,
      allowNull: true,
      field: 'price'
    });

    // Add is_new field to products table
    await queryInterface.addColumn('products', 'is_new', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_new'
    });

    // Update the type enum to include new promotion types
    await queryInterface.changeColumn('promotions', 'type', {
      type: Sequelize.ENUM('discount', 'bundle', 'bogo', '2+1', 'box'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove price field from promotions table
    await queryInterface.removeColumn('promotions', 'price');

    // Remove is_new field from products table
    await queryInterface.removeColumn('products', 'is_new');

    // Revert the type enum to original values
    await queryInterface.changeColumn('promotions', 'type', {
      type: Sequelize.ENUM('discount', 'bundle', 'bogo'),
      allowNull: false
    });
  }
};
