import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Promotion extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public type!: 'discount' | 'bundle' | 'bogo' | '2+1' | 'box';
  public discountValue!: number | null;
  public price!: number | null;
  public startDate!: Date;
  public endDate!: Date;
  public isActive!: boolean;
  public quantityRequired!: number | null;
  public quantityFree!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Promotion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('discount', 'bundle', 'bogo', '2+1', 'box'),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'discount_value'
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'price'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
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
    }
  },
  {
    sequelize,
    modelName: 'Promotion',
    tableName: 'promotions',
    indexes: [
      { fields: ['type'] },
      { fields: ['is_active'] },
    ],
  }
);

export default Promotion; 