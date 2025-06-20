import dotenv from 'dotenv';

dotenv.config();

// JWT Configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '24h'
};

// Validate JWT secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET is not set in environment variables. Using default secret key.');
} 