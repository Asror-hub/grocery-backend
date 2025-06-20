import express from 'express';
import {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  setNewProducts,
  setRecommendedProducts
} from '../controllers/promotionController';
import { auth, adminAuth } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', getAllPromotions);
router.get('/:id', getPromotionById);

// Admin only routes
router.post('/', auth, adminAuth, createPromotion);
router.put('/:id', auth, adminAuth, updatePromotion);
router.delete('/:id', auth, adminAuth, deletePromotion);
router.post('/set-new-products', auth, adminAuth, setNewProducts);
router.post('/set-recommended', auth, adminAuth, setRecommendedProducts);

export default router; 