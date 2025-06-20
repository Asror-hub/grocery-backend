import express from 'express';
import settingsController from '../controllers/settingsController';
import { auth, adminAuth } from '../middlewares/auth';

const router = express.Router();

// Admin routes (protected)
router.get('/admin', auth, adminAuth, settingsController.getSettings);
router.put('/admin', auth, adminAuth, settingsController.updateSettings);

// Public routes
router.get('/shop-hours', settingsController.getShopHours);
router.get('/shop-status', settingsController.isShopOpen);

export default router; 