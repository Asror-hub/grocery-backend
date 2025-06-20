import express from 'express';
import { auth } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../controllers/adminUserController';

const router = express.Router();

// All routes require both authentication and admin privileges
router.use(auth, isAdmin);

// Get all admin users
router.get('/', getAdminUsers);

// Create new admin user
router.post('/', createAdminUser);

// Update admin user
router.put('/:id', updateAdminUser);

// Delete admin user
router.delete('/:id', deleteAdminUser);

export default router; 