import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class PromotionProduct extends Model {
  public id!: number;
  public promotionId!: number;
  public productId!: number;
  public quantityRequired!: number | null;
  public quantityFree!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PromotionProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    promotionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'promotion_id',
      references: {
        model: 'promotions',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantityRequired: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'quantity_required'
    },
    quantityFree: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'quantity_free'
    },
  },
  {
    sequelize,
    modelName: 'PromotionProduct',
    tableName: 'promotion_products',
    indexes: [
      { fields: ['promotion_id'] },
      { fields: ['product_id'] },
    ],
  }
);

export default PromotionProduct; 