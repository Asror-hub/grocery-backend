import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Notification extends Model {
  public id!: number;
  public userId!: number;
  public orderId!: number;
  public message!: string;
  public isRead!: boolean;
  public type!: 'order_status' | 'order_accepted' | 'order_rejected';
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM('order_status', 'order_accepted', 'order_rejected'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
  }
);

export default Notification; 