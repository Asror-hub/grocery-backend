import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { auth, adminAuth } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin only routes
router.post('/', auth, adminAuth, createCategory);
router.put('/:id', auth, adminAuth, updateCategory);
router.delete('/:id', auth, adminAuth, deleteCategory);

export default router; 