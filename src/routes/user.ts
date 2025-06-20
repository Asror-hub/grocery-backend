import express from 'express';
import { auth } from '../middlewares/auth';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/user';

const router = express.Router();

// Get all users
router.get('/', auth, getUsers);

// Create new user
router.post('/', auth, createUser);

// Update user
router.put('/:id', auth, updateUser);

// Delete user
router.delete('/:id', auth, deleteUser);

// Toggle user status
router.patch('/:id/toggle-status', auth, toggleUserStatus);

export default router; 