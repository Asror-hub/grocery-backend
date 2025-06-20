import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWT_CONFIG } from '../config/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    console.log('Registration attempt for:', { email, name, phone });

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Email already registered:', email);
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create user (password will be hashed by the model hook)
    console.log('Creating user...');
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the model hook
      phone,
      role: 'customer'
    });
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}

    console.log('User created successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_CONFIG.secret,
      { expiresIn: '24h' }
    );

    console.log('Registration successful for:', email);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user
    const user = await User.findOne({ where: { email } });
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}

    if (!user) {
      console.log('User not found for email:', email);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    // If user exists but is not a customer, convert them to a customer
    if (user.role !== 'customer') {
      console.log('Converting user to customer role:', email);
      user.role = 'customer';
      await user.save();
    }

    console.log('Comparing passwords...');
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', validPassword);
    console.log('Input password length:', password.length);
    console.log('Stored password hash length:', user.password.length);

    if (!validPassword) {
      console.log('Invalid password for user:', email);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_CONFIG.secret,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Since we're using JWT tokens, we don't need to do anything on the server
    // The client will handle removing the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error during logout' });
  }
}; 