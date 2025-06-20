import { Request, Response } from 'express';
import Admin from '../models/Admin';

// Get all admin users
export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Error fetching admin users' });
  }
};

// Create new admin user
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      phone,
      password,
      status: 'active'
    });

    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.status(201).json(adminResponse);
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
};

// Update admin user
export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update admin fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    await admin.save();
    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.json(adminResponse);
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({ message: 'Error updating admin user' });
  }
};

// Delete admin user
export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await admin.destroy();
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ message: 'Error deleting admin user' });
  }
}; 