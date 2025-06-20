import sequelize from './database';
import User from '../models/User';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import bcrypt from 'bcryptjs';

export const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models with database
    await sequelize.sync(); // Remove force: true to preserve data
    console.log('Database synchronized successfully.');

    // Check if admin user exists
    const adminExists = await User.findOne({
      where: {
        email: 'admin@example.com',
        role: 'admin'
      }
    });

    // Create default admin user if not exists
    if (!adminExists) {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+998901234567',
        password: '123456', // The password will be hashed by the User model's beforeCreate hook
        role: 'admin',
        status: 'active'
      });
      console.log('Default admin user created successfully:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      });
    }

    // Create default categories if they don't exist
    const categories = [
      { name: 'Bakery', description: 'Bread, pastries and baked goods' },
      { name: 'Beverages', description: 'Drinks, juices and water' },
      { name: 'Snacks', description: 'Chips, cookies and other snacks' },
      { name: 'Canned Goods', description: 'Canned fruits, vegetables and other preserved foods' },
      { name: 'Frozen Foods', description: 'Frozen meals, vegetables and desserts' },
      { name: 'Household', description: 'Cleaning supplies and household items' },
      { name: 'Personal Care', description: 'Toiletries and personal hygiene products' }
    ];

    for (const category of categories) {
      await Category.findOrCreate({
        where: { name: category.name },
        defaults: category
      });
    }
    console.log('Default categories created successfully.');

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}; 