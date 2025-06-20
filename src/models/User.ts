import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!: string;
  public password!: string;
  public role!: 'customer' | 'admin';
  public status!: 'active' | 'inactive';
  public address!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      console.log('Password comparison details:');
      console.log('Candidate password:', candidatePassword);
      console.log('Stored hash:', this.password);
      
      const result = await bcrypt.compare(candidatePassword, this.password);
      console.log('Password comparison result:', result);
      return result;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^\+?[1-9]\d{1,14}$/, // E.164 format
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100], // Minimum 6 characters
      },
    },
    role: {
      type: DataTypes.ENUM('customer', 'admin'),
      defaultValue: 'customer',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    indexes: [
      {
        fields: ['email'],
      },
      {
        fields: ['phone'],
      },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          console.log('Creating user with password hash:', hashedPassword);
          user.password = hashedPassword;
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          console.log('Updating user with new password hash:', hashedPassword);
          user.password = hashedPassword;
        }
      },
    },
  }
);

export default User; 