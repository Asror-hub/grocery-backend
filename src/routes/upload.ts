import express, { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController';
import { auth, adminAuth } from '../middlewares/auth';
import { uploadToB2, deleteFromB2 } from '../config/storage';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File received:', file);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload route (admin only)
router.post('/', auth, adminAuth, upload.single('image'), uploadFile);

// Test upload endpoint
const testUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Test upload request received');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);

    if (!req.file) {
      console.log('No file in request');
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;
    console.log('File details:', { originalname, mimetype, size: buffer.length });

    const url = await uploadToB2(buffer, originalname, mimetype);
    console.log('File uploaded successfully:', url);

    res.json({ url });
  } catch (error) {
    console.error('Error in test upload:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// Test delete endpoint
const testDelete: RequestHandler = async (req, res) => {
  try {
    const { fileUrl } = req.params;
    await deleteFromB2(fileUrl);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error in test delete:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

router.post('/test', upload.single('file'), testUpload);
router.delete('/test/:fileUrl', testDelete);

export default router; 