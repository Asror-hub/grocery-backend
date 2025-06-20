import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';
import Product from './Product';

class OrderItem extends Model {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    indexes: [
      {
        fields: ['order_id'],
      },
      {
        fields: ['product_id'],
      },
    ],
  }
);

export default OrderItem; 