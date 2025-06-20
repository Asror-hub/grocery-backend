import { Customer } from '../models';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    // Create test customer
    const customerExists = await Customer.findOne({ where: { email: 'asror@email.com' } });
    if (!customerExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await Customer.create({
        name: 'Asror',
        email: 'asror@email.com',
        phone: '+1234567890',
        password: hashedPassword
      });
      console.log('Test customer created');
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}; 