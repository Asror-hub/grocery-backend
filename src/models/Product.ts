import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

interface ProductAttributes {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl?: string;
  isDeleted: boolean;
  isNew: boolean;
  isRecommended: boolean;
  category?: Category;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'imageUrl' | 'isDeleted'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public stockQuantity!: number;
  public categoryId!: number;
  public imageUrl?: string;
  public isDeleted!: boolean;
  public isNew!: boolean;
  public isRecommended!: boolean;
  public category?: Category;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_deleted'
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_new'
    },
    isRecommended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_recommended'
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    indexes: [
      {
        unique: true,
        fields: ['name'],
        where: {
          is_deleted: false
        },
        name: 'products_name_unique'
      }
    ]
  }
);

export default Product; 