import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: { exclude: ['password'] }
    });
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}


    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findByPk(req.user?.id);
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}


    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user?.id);
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}


    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
}; 