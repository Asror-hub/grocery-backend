import express from 'express';
import { auth } from '../middlewares/auth';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController';

const router = express.Router();

// Get user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.put('/profile', auth, updateProfile);

// Change password
router.post('/change-password', auth, changePassword);

export default router; 