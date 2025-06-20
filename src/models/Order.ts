import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Order extends Model {
  public id!: number;
  public userId!: number;
  public totalAmount!: number;
  public status!: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  public paymentMethod!: 'cash' | 'online';
  public paymentStatus!: 'pending' | 'paid' | 'failed';
  public deliveryAddress!: string;
  public deletedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'total_amount',
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'online'),
      defaultValue: 'cash',
      field: 'payment_method',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
      field: 'payment_status',
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'delivery_address',
      validate: {
        notEmpty: true,
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['deleted_at'],
      },
    ],
  }
);

export default Order; 