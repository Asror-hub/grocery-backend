import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('promotions', 'quantity_required', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.addColumn('promotions', 'quantity_free', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('promotions', 'quantity_required');
  await queryInterface.removeColumn('promotions', 'quantity_free');
} 