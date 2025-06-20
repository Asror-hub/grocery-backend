import B2 from 'backblaze-b2';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'B2_ACCOUNT_ID',
  'B2_APPLICATION_KEY',
  'B2_BUCKET_NAME',
  'B2_PUBLIC_URL',
  'B2_DOWNLOAD_URL'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!,
});

let bucketId: string | null = null;

export const initializeB2 = async () => {
  try {
    await b2.authorize();
    
    // Get bucket ID
    const buckets = await b2.listBuckets();
    const bucket = buckets.data.buckets.find((b: { bucketName: string }) => b.bucketName === process.env.B2_BUCKET_NAME);
    if (!bucket) {
      throw new Error(`Bucket ${process.env.B2_BUCKET_NAME} not found`);
    }
    bucketId = bucket.bucketId;
    
    console.log('Backblaze B2 storage initialized successfully');
  } catch (error) {
    console.error('Error initializing Backblaze B2:', error);
    throw error;
  }
};

export const uploadToB2 = async (
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  try {
    console.log('📤 B2 UPLOAD STARTED:', fileName);

    if (!bucketId) {
      console.log('❌ B2 UPLOAD FAILED: Storage not initialized');
      throw new Error('B2 storage not initialized');
    }

    // Authorize with B2
    await b2.authorize();

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId,
    });

    // Generate a unique file name
    const timestamp = Date.now();
    // Clean the filename - remove any double dots and sanitize
    const cleanFileName = fileName.replace(/\.+/g, '.').replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `products/${timestamp}-${cleanFileName}`;

    console.log('📝 Generated unique filename:', uniqueFileName);

    // Upload file
    const response = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: uniqueFileName,
      contentLength: buffer.length,
      mime: mimeType,
      data: buffer,
    });

    // Make sure we're using the correct public URL format with bucket name
    const publicUrl = `${process.env.B2_PUBLIC_URL}/${process.env.B2_BUCKET_NAME}/${response.data.fileName}`;
    console.log('✅ B2 UPLOAD COMPLETED:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.log('❌ B2 UPLOAD FAILED:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to upload file to storage');
  }
};

export const deleteFromB2 = async (fileUrl: string): Promise<void> => {
  try {
    console.log('🗑️ B2 DELETE STARTED:', fileUrl);
    
    if (!bucketId) {
      throw new Error('B2 storage not initialized');
    }

    // Authorize with B2
    await b2.authorize();

    // Extract the file path from the URL
    // URL format: https://f005.backblazeb2.com/file/GroceryApp/products/timestamp-filename.jpg
    const urlParts = fileUrl.split('/file/');
    if (urlParts.length !== 2) {
      throw new Error('Invalid file URL format');
    }
    
    // Get the full path after /file/
    const fullPath = urlParts[1];
    // Remove the bucket name from the path if it exists
    const filePath = fullPath.replace(`${process.env.B2_BUCKET_NAME}/`, '');
    
    console.log('🗑️ Attempting to delete file:', filePath);

    // Get file info first
    const fileInfo = await b2.listFileNames({
      bucketId,
      prefix: filePath,
      maxFileCount: 1,
      delimiter: '',
      startFileName: filePath
    });

    if (!fileInfo.data.files || fileInfo.data.files.length === 0) {
      console.log('❌ File not found in B2:', filePath);
      throw new Error(`File not found in B2: ${filePath}`);
    }

    const file = fileInfo.data.files[0];
    console.log('📝 Found file in B2:', file.fileName);

    // Delete the file using the B2 SDK
    await b2.deleteFileVersion({
      fileName: file.fileName,
      fileId: file.fileId
    });

    console.log('✅ Successfully deleted file from B2:', file.fileName);
  } catch (error) {
    console.log('❌ B2 DELETE FAILED:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export default b2; 