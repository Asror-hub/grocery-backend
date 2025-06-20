import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/User';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_SECRET = process.env.JWT_SECRET;

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  }
}

export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate password
    if (password.length < 6) {
      res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      res.status(400).json({ 
        error: 'User already exists with this email or phone' 
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'customer',
    });
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}


    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Error registering user' });
    }
  }
};

export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Error logging in' });
    }
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Since we're using JWT, we don't need to do anything on the server side
    // The client will handle removing the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
}; 