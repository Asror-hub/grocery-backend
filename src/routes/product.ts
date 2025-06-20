import express, { Request, Response } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  deleteProductImage
} from '../controllers/productController';
import { auth, adminAuth } from '../middlewares/auth';
import multer from 'multer';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: Request, res: Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
    res.status(400).json({ error: err.message });
  } else if (err) {
    res.status(400).json({ error: err.message });
  }
  next();
};

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

// Admin only routes
router.post('/', 
  auth, 
  adminAuth, 
  upload.single('image'), 
  handleMulterError,
  createProduct as express.RequestHandler
);

router.put('/:id', 
  auth, 
  adminAuth, 
  upload.single('image'), 
  handleMulterError,
  updateProduct as express.RequestHandler
);

router.delete('/:id', auth, adminAuth, deleteProduct as express.RequestHandler);
router.delete('/:id/image', auth, adminAuth, deleteProductImage as express.RequestHandler);

export default router; 