import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

class Admin extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!: string;
  public password!: string;
  public status!: 'active' | 'inactive';
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

Admin.init(
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
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins', // Explicitly set table name
    indexes: [
      {
        fields: ['email'],
      },
      {
        fields: ['phone'],
      },
    ],
    hooks: {
      beforeCreate: async (admin: Admin) => {
        if (admin.password) {
          const hashedPassword = await bcrypt.hash(admin.password, 10);
          console.log('Creating admin with password hash:', hashedPassword);
          admin.password = hashedPassword;
        }
      },
      beforeUpdate: async (admin: Admin) => {
        if (admin.changed('password')) {
          const hashedPassword = await bcrypt.hash(admin.password, 10);
          console.log('Updating admin with new password hash:', hashedPassword);
          admin.password = hashedPassword;
        }
      },
    },
  }
);

export default Admin; 