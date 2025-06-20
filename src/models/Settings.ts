import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Settings extends Model {
  public id!: number;
  public key!: string;
  public value!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Settings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Settings',
    tableName: 'settings',
    indexes: [
      {
        fields: ['key'],
      },
    ],
  }
);

export default Settings; 