import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { JWT_CONFIG } from '../config/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    console.log('Admin registration attempt:', { name, email, phone });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      console.log('Admin already exists:', email);
      res.status(400).json({ error: 'Email already registered' });
    }

    // Create admin (password will be hashed by Admin model hooks)
    const admin = await Admin.create({
      name,
      email,
      password,
      phone,
      status: 'active'
    });
if (!admin) {
  res.status(404).json({ message: 'Admin not found' });
  return;
}

    console.log('Admin created successfully:', { id: admin.id, email: admin.email });

    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: 'admin', isAdmin: true },
      JWT_CONFIG.secret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin registration successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Error during admin registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Login request body:', req.body);
    console.log('🔍 Login request headers:', req.headers);
    
    const { email, password } = req.body;
    console.log('Admin login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password });
      res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin
    const admin = await Admin.findOne({ where: { email } });
if (!admin) {
  res.status(404).json({ message: 'Admin not found' });
  return;
}

    
    if (!admin) {
      console.log('Admin not found:', email);
      res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Admin found:', { 
      id: admin.id, 
      email: admin.email,
      hasPassword: !!admin.password
    });

    // Check password using the model's comparePassword method
    const validPassword = await admin.comparePassword(password);
    console.log('Password validation result:', validPassword);
    
    if (!validPassword) {
      console.log('Invalid password for admin:', email);
      res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password validated successfully for admin:', email);

    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: 'admin', isAdmin: true },
      JWT_CONFIG.secret,
      { expiresIn: '24h' }
    );

    const response = {
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'admin'
      }
    };

    console.log('✅ Sending successful login response');
    res.json(response);
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Error during admin login' });
  }
}; 