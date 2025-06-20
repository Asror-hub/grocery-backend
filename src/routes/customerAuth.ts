import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Customer from '../models/Customer';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Customer auth routes are working' });
});

// Customer Registration
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array().map(err => err.msg)
      });
      return;
    }

    const { name, email, phone, password } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      res.status(400).json({
        error: 'Email already registered'
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const customer = await Customer.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: customer.id,
        email: customer.email,
        role: 'customer'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({
      error: 'Error registering customer'
    });
  }
});

// Customer Login
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array().map(err => err.msg)
      });
      return;
    }

    const { email, password } = req.body;

    // Find customer
    const customer = await Customer.findOne({ where: { email } });

    if (!customer) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: customer.id,
        email: customer.email,
        role: 'customer'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      error: 'Error during login'
    });
  }
});

// Customer Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Since we're using JWT tokens, we don't need to do anything on the server
    // The client will handle removing the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Customer logout error:', error);
    res.status(500).json({
      error: 'Error during logout'
    });
  }
});

export default router; 