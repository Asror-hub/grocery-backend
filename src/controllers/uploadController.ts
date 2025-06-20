import { Request, Response } from 'express';
import { uploadToB2 } from '../config/storage';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    console.log('File received:', req.file);
    console.log('Test upload request received');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);

    const { originalname, mimetype, buffer, size } = req.file;
    console.log('File details:', { originalname, mimetype, size });

    const url = await uploadToB2(buffer, originalname, mimetype);
    console.log('Generated public URL:', url);
    console.log('File uploaded successfully:', url);

    res.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
}; 